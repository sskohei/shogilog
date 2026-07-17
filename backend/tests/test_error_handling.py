from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.v1.endpoints.dashboard import get_dashboard_service
from app.dependencies.auth import get_current_user
from app.main import app
from app.schemas.auth import AuthUser


class RaisingDashboardService:
    def get_dashboard(self, user_id):
        raise RuntimeError("boom")


def test_unhandled_exception_returns_uniform_500_body():
    app.dependency_overrides[get_current_user] = lambda: AuthUser(
        id=uuid4(), email="test@example.com", role="authenticated"
    )
    app.dependency_overrides[get_dashboard_service] = RaisingDashboardService

    try:
        client = TestClient(app, raise_server_exceptions=False)
        response = client.get("/api/v1/dashboard")
    finally:
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_dashboard_service, None)

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error"}


def test_http_exception_paths_are_unaffected():
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/api/v1/dashboard")

    assert response.status_code == 401
    assert response.json() == {
        "detail": "Authentication credentials were not provided."
    }
