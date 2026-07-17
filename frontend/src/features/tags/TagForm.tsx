"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTagAction, updateTagAction } from "@/features/tags/actions";
import { initialTagFormState } from "@/features/tags/types";
import { useActionErrorToast } from "@/lib/useActionErrorToast";
import type { Tag } from "@/types/tag";

const DEFAULT_COLOR = "#94a3b8";

export function TagForm({
  mode = "create",
  tag,
  onSuccess,
}: {
  mode?: "create" | "edit";
  tag?: Tag;
  onSuccess?: () => void;
}) {
  const action =
    mode === "edit" && tag ? updateTagAction.bind(null, tag.id) : createTagAction;
  const [state, formAction, pending] = useActionState(action, initialTagFormState);
  useActionErrorToast(state.message);
  const [resetKey, setResetKey] = useState(0);

  // action が完了して state 参照が更新された瞬間にだけ後処理を行う
  // (レンダー中の state 調整パターン: https://react.dev/learn/you-might-not-need-an-effect)
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    const succeeded = Object.keys(state.errors).length === 0 && !state.message;
    if (succeeded) {
      if (mode === "create") {
        setResetKey((key) => key + 1);
      } else {
        onSuccess?.();
      }
    }
  }

  return (
    <form key={resetKey} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">タグ名</Label>
        <Input
          id="name"
          name="name"
          maxLength={255}
          defaultValue={tag?.name}
          aria-invalid={state.errors.name ? true : undefined}
          aria-describedby={state.errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error" messages={state.errors.name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="color">色</Label>
        <input
          id="color"
          name="color"
          type="color"
          defaultValue={tag?.color ?? DEFAULT_COLOR}
          aria-invalid={state.errors.color ? true : undefined}
          aria-describedby={state.errors.color ? "color-error" : undefined}
          className="h-8 w-14 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
        />
        <FieldError id="color-error" messages={state.errors.color} />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {mode === "edit" ? "更新する" : "追加する"}
      </Button>

      {state.message && (
        <p className="w-full text-sm text-destructive" aria-live="polite">
          {state.message}
        </p>
      )}
    </form>
  );
}
