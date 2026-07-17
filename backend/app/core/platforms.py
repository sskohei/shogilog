from typing import Literal

RatingMetric = Literal["rating", "percentage", "point"]

# frontend/src/features/games/platforms.ts のメタ情報をミラーしたもの。
# platforms テーブルにメタ情報が追加されたら、そちらから解決する形に差し替える。
PLATFORM_RATING_METRICS: dict[int, RatingMetric] = {
    1: "percentage",
    2: "rating",
    3: "point",
    4: "rating",
}

PLATFORM_RANK_LADDERS: dict[int, tuple[int, int]] = {  # (max_kyu, max_dan)
    1: (30, 9),
    3: (10, 5),
}

_DAN_KANJI = ["初段", "二段", "三段", "四段", "五段", "六段", "七段", "八段", "九段"]


def get_rating_metric(platform_id: int) -> RatingMetric:
    return PLATFORM_RATING_METRICS.get(platform_id, "rating")


def get_rank_options(platform_id: int) -> list[str]:
    ladder = PLATFORM_RANK_LADDERS.get(platform_id)
    if ladder is None:
        return []
    max_kyu, max_dan = ladder
    return [f"{n}級" for n in range(max_kyu, 0, -1)] + _DAN_KANJI[:max_dan]


def is_valid_rating_value(platform_id: int, value: int) -> bool:
    if value < 0:
        return False
    if get_rating_metric(platform_id) == "percentage":
        return value <= 100
    return True


def is_valid_rank(platform_id: int, rank: str | None) -> bool:
    if rank is None:
        return True
    return rank in get_rank_options(platform_id)
