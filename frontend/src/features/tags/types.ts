import type { TagFormFieldErrors } from "@/features/tags/validation";

// エラーメッセージだけを返す単純な Server Action(削除など)向けの共通 state。
export type SimpleActionState = {
  error?: string;
};

export const initialSimpleActionState: SimpleActionState = {};

export type TagFormState = {
  errors: TagFormFieldErrors;
  message?: string;
};

export const initialTagFormState: TagFormState = { errors: {} };
