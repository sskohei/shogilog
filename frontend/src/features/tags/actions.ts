"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/fetcher";
import { createTag, deleteTag, updateTag } from "@/services/api/tags";
import type { TagFormState } from "@/features/tags/types";
import {
  toOptionalColor,
  validateTagInput,
  type TagFormFieldErrors,
} from "@/features/tags/validation";
import { getApiErrorFieldNames } from "@/lib/apiFieldErrors";
import { getApiErrorMessage } from "@/lib/errorMessages";
import type { SimpleActionState } from "@/types/actionState";
import type { TagCreatePayload } from "@/types/tag";

const TAG_FIELD_ERROR_MESSAGES: Record<keyof TagFormFieldErrors, string> = {
  name: "タグ名が長すぎます",
  color: "色の形式が正しくありません",
};

function mapTagFieldErrors(error: ApiError): TagFormFieldErrors {
  const fieldNames = getApiErrorFieldNames(error);
  const errors: TagFormFieldErrors = {};

  for (const [field, message] of Object.entries(TAG_FIELD_ERROR_MESSAGES) as [
    keyof TagFormFieldErrors,
    string,
  ][]) {
    if (fieldNames.has(field)) {
      errors[field] = [message];
    }
  }

  return errors;
}

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
    if (error instanceof ApiError && error.status === 422) {
      const fieldErrors = mapTagFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        return { errors: fieldErrors, message: "入力内容を確認してください。" };
      }
    }
    return {
      errors: {},
      message: error instanceof ApiError
        ? getApiErrorMessage(error, "タグの作成に失敗しました。")
        : "タグの作成に失敗しました。",
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
    if (error instanceof ApiError && error.status === 422) {
      const fieldErrors = mapTagFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        return { errors: fieldErrors, message: "入力内容を確認してください。" };
      }
    }
    return {
      errors: {},
      message: error instanceof ApiError
        ? getApiErrorMessage(error, "タグの更新に失敗しました。")
        : "タグの更新に失敗しました。",
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
      error: error instanceof ApiError
        ? getApiErrorMessage(error, "タグの削除に失敗しました。")
        : "タグの削除に失敗しました。",
    };
  }

  revalidatePath("/tags");
  return {};
}
