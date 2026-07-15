import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Pagination } from "@/types/game";

function buildHref(page: number, limit: number): string {
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return `/games?${searchParams.toString()}`;
}

export function GamesPagination({ pagination }: { pagination: Pagination }) {
  const { page, limit, total_pages: totalPages } = pagination;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {pagination.total}件中 {page} / {Math.max(totalPages, 1)} ページ
      </p>
      <div className="flex gap-2">
        {hasPrev ? (
          <Button
            render={<Link href={buildHref(page - 1, limit)}>前へ</Link>}
            nativeButton={false}
            variant="outline"
            size="sm"
          />
        ) : (
          <Button variant="outline" size="sm" disabled>
            前へ
          </Button>
        )}
        {hasNext ? (
          <Button
            render={<Link href={buildHref(page + 1, limit)}>次へ</Link>}
            nativeButton={false}
            variant="outline"
            size="sm"
          />
        ) : (
          <Button variant="outline" size="sm" disabled>
            次へ
          </Button>
        )}
      </div>
    </div>
  );
}
