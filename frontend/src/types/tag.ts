export type Tag = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type TagListResponse = {
  data: Tag[];
};

export type TagIdResponse = {
  data: {
    id: string;
  };
};

export type TagCreatePayload = {
  name: string;
  color?: string | null;
};
