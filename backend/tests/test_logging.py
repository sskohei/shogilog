import json
import logging
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi.testclient import TestClient
from jose import jwt

from app.api.v1.endpoints.dashboard import get_dashboard_service
from app.core import security
from app.core.logging import JsonLogFormatter
from app.dependencies.auth import get_current_user
from app.main import app
from app.schemas.auth import AuthUser
from app.schemas.dashboard import DashboardData, DashboardResponse


def _make_log_record(**extra) -> logging.LogRecord:
    record = logging.LogRecord(
        name="app.access",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="GET /api/v1/dashboard 200",
        args=(),
        exc_info=None,
    )
    for key, value in extra.items():
        setattr(record, key, value)
    return record


def test_json_log_formatter_includes_extra_fields():
    record = _make_log_record(
        request_id="req-1",
        user_id="user-1",
        method="GET",
        path="/api/v1/dashboard",
        status_code=200,
        response_time_ms=12.3,
    )

    payload = json.loads(JsonLogFormatter().format(record))

    assert payload["message"] == "GET /api/v1/dashboard 200"
    assert payload["level"] == "INFO"
    assert payload["logger"] == "app.access"
    assert payload["request_id"] == "req-1"
    assert payload["user_id"] == "user-1"
    assert payload["method"] == "GET"
    assert payload["path"] == "/api/v1/dashboard"
    assert payload["status_code"] == 200
    assert payload["response_time_ms"] == 12.3


def test_json_log_formatter_omits_unset_extra_fields():
    record = _make_log_record()

    payload = json.loads(JsonLogFormatter().format(record))

    assert "request_id" not in payload
    assert "user_id" not in payload


def test_access_log_emitted_for_public_route(caplog):
    with caplog.at_level(logging.INFO, logger="app.access"):
        client = TestClient(app)
        response = client.get("/")

    assert response.status_code == 200
    assert "X-Request-ID" in response.headers

    records = [r for r in caplog.records if r.name == "app.access"]
    assert len(records) == 1

    record = records[0]
    assert record.method == "GET"
    assert record.path == "/"
    assert record.status_code == 200
    assert record.response_time_ms >= 0
    assert record.request_id == response.headers["X-Request-ID"]
    assert record.user_id is None


def test_access_log_records_authenticated_user_id(caplog, ec_key_pair):
    class EmptyDashboardService:
        def get_dashboard(self, user_id):
            return DashboardResponse(
                data=DashboardData(
                    total_games=0,
                    win_rate=0.0,
                    recent_games=[],
                    platform_stats=[],
                    opening_stats=[],
                    side_stats=[],
                    daily_stats=[],
                    weekly_stats=[],
                    monthly_stats=[],
                    yearly_stats=[],
                    rating_history=[],
                )
            ).data

    security._jwks_cache = None
    security._jwks_cache_expires_at = 0.0
    orig_fetch_jwks = security._fetch_jwks
    security._fetch_jwks = lambda: {"keys": [ec_key_pair["public_jwk"]]}

    user_id = str(uuid4())
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": user_id,
            "role": "authenticated",
            "email": "test@example.com",
            "iat": now,
            "exp": now + timedelta(hours=1),
        },
        ec_key_pair["private_pem"],
        algorithm="ES256",
        headers={"kid": ec_key_pair["kid"]},
    )

    app.dependency_overrides[get_dashboard_service] = EmptyDashboardService

    try:
        with caplog.at_level(logging.INFO, logger="app.access"):
            client = TestClient(app)
            response = client.get(
                "/api/v1/dashboard",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        app.dependency_overrides.pop(get_dashboard_service, None)
        security._fetch_jwks = orig_fetch_jwks
        security._jwks_cache = None
        security._jwks_cache_expires_at = 0.0

    assert response.status_code == 200

    records = [r for r in caplog.records if r.name == "app.access"]
    assert len(records) == 1
    assert records[0].user_id == user_id


def test_unhandled_exception_logs_error_with_request_context(caplog):
    class RaisingDashboardService:
        def get_dashboard(self, user_id):
            raise RuntimeError("boom")

    app.dependency_overrides[get_current_user] = lambda: AuthUser(
        id=uuid4(), email="test@example.com", role="authenticated"
    )
    app.dependency_overrides[get_dashboard_service] = RaisingDashboardService

    try:
        with caplog.at_level(logging.ERROR, logger="app.main"):
            client = TestClient(app, raise_server_exceptions=False)
            response = client.get("/api/v1/dashboard")
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_dashboard_service, None)

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error"}

    error_records = [r for r in caplog.records if r.name == "app.main"]
    assert len(error_records) == 1
    assert error_records[0].method == "GET"
    assert error_records[0].path == "/api/v1/dashboard"
    assert error_records[0].request_id
