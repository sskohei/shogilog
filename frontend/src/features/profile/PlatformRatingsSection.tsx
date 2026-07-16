import { PlatformRatingRow } from "@/features/profile/PlatformRatingRow";
import type { PlatformRating } from "@/types/profile";

export function PlatformRatingsSection({ ratings }: { ratings: PlatformRating[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">プラットフォーム別レート</h2>
      <div className="space-y-2">
        {ratings.map((rating) => (
          <PlatformRatingRow key={rating.platform_id} rating={rating} />
        ))}
      </div>
    </section>
  );
}
