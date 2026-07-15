export type OpeningCategory = "static_rook" | "ranging_rook" | "other";

export type Opening = {
  id: number;
  name: string;
  slug: string;
  category: OpeningCategory;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type OpeningListResponse = {
  data: Opening[];
};
