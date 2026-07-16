"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/fetcher";
import { createTag, deleteTag, updateTag } from "@/services/api/tags";
import type { SimpleActionState, TagFormState } from "@/features/tags/types";
import { toOptionalColor, validateTagInput } from "@/features/tags/validation";
import type { TagCreatePayload } from "@/types/tag";

export async function createTagAction(
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  const input = {
    name: formData.get("name"),
    color: formData.get("color"),
  };
  const errors = validateTagInput(input);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const payload: TagCreatePayload = {
    name: (typeof input.name === "string" ? input.name.trim() : ""),
    color: toOptionalColor(input.color),
  };

  try {
    await createTag(payload);
  } catch (error) {
    return {
      errors: {},
      message:
        error instanceof ApiError ? error.message : "タグの作成に失敗しました。",
    };
  }

  revalidatePath("/tags");
  return { errors: {} };
}

export async function updateTagAction(
  tagId: string,
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  const input = {
    name: formData.get("name"),
    color: formData.get("color"),
  };
  const errors = validateTagInput(input);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const payload: TagCreatePayload = {
    name: (typeof input.name === "string" ? input.name.trim() : ""),
    color: toOptionalColor(input.color),
  };

  try {
    await updateTag(tagId, payload);
  } catch (error) {
    return {
      errors: {},
      message:
        error instanceof ApiError ? error.message : "タグの更新に失敗しました。",
    };
  }

  revalidatePath("/tags");
  return { errors: {} };
}

export async function deleteTagAction(
  tagId: string,
  _prevState: SimpleActionState,
  _formData: FormData
): Promise<SimpleActionState> {
  try {
    await deleteTag(tagId);
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "タグの削除に失敗しました。",
    };
  }

  revalidatePath("/tags");
  return {};
}
