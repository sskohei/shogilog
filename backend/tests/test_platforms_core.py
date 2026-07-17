from app.core.platforms import get_rank_options, is_valid_rank, is_valid_rating_value


def test_get_rank_options_returns_kyu_then_dan_for_shogiwars():
    options = get_rank_options(1)

    assert options[0] == "30級"
    assert options[29] == "1級"
    assert options[30] == "初段"
    assert options[-1] == "九段"
    assert len(options) == 39


def test_get_rank_options_returns_empty_for_rating_only_platform():
    assert get_rank_options(2) == []
    assert get_rank_options(4) == []


def test_is_valid_rating_value_rejects_negative_for_any_platform():
    assert is_valid_rating_value(1, -1) is False
    assert is_valid_rating_value(2, -1) is False


def test_is_valid_rating_value_caps_percentage_platform_at_100():
    assert is_valid_rating_value(1, 100) is True
    assert is_valid_rating_value(1, 101) is False


def test_is_valid_rating_value_allows_any_non_negative_for_rating_metric():
    assert is_valid_rating_value(2, 3000) is True


def test_is_valid_rank_allows_none():
    assert is_valid_rank(1, None) is True


def test_is_valid_rank_checks_membership_in_ladder():
    assert is_valid_rank(1, "初段") is True
    assert is_valid_rank(1, "10段") is False


def test_is_valid_rank_rejects_any_rank_for_rating_only_platform():
    assert is_valid_rank(2, "初段") is False
