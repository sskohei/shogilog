export type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileDataResponse = {
  data: Profile;
};

export type ProfileUpdatePayload = {
  display_name?: string | null;
  bio?: string | null;
};

export type PlatformRating = {
  platform_id: number;
  has_played: boolean;
  rating: number | null;
  rank: string | null;
  updated_at: string | null;
};

export type PlatformRatingListResponse = {
  data: PlatformRating[];
};

export type PlatformRatingUpsertPayload = {
  has_played: boolean;
  rating?: number | null;
  rank?: string | null;
};
