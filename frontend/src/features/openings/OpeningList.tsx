import { FavoriteButton } from "@/features/openings/FavoriteButton";
import type { Opening, OpeningCategory } from "@/types/opening";

const CATEGORY_LABELS: Record<OpeningCategory, string> = {
  static_rook: "居飛車",
  ranging_rook: "振り飛車",
  other: "その他",
};

const CATEGORY_ORDER: OpeningCategory[] = ["static_rook", "ranging_rook", "other"];

export function OpeningList({
  openings,
  favoriteOpeningIds,
}: {
  openings: Opening[];
  favoriteOpeningIds: number[];
}) {
  const favoriteIds = new Set(favoriteOpeningIds);

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((category) => {
        const categoryOpenings = openings.filter(
          (opening) => opening.category === category
        );

        if (categoryOpenings.length === 0) return null;

        return (
          <section key={category} className="space-y-2">
            <h2 className="text-sm font-medium">{CATEGORY_LABELS[category]}</h2>
            <div className="space-y-2">
              {categoryOpenings.map((opening) => (
                <div
                  key={opening.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{opening.name}</p>
                    {opening.description && (
                      <p className="text-xs text-muted-foreground">
                        {opening.description}
                      </p>
                    )}
                  </div>
                  <FavoriteButton
                    openingId={opening.id}
                    isFavorite={favoriteIds.has(opening.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
