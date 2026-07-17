import type { TagFormFieldErrors } from "@/features/tags/validation";

export type TagFormState = {
  errors: TagFormFieldErrors;
  message?: string;
};

export const initialTagFormState: TagFormState = { errors: {} };
