"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/features/profile/actions";
import { initialProfileFormState } from "@/features/profile/types";
import type { Profile } from "@/types/profile";

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {messages[0]}
    </p>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialProfileFormState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="display_name">表示名</Label>
        <Input
          id="display_name"
          name="display_name"
          maxLength={30}
          defaultValue={profile.display_name ?? undefined}
          aria-invalid={state.errors.display_name ? true : undefined}
          aria-describedby={
            state.errors.display_name ? "display_name-error" : undefined
          }
        />
        <FieldError id="display_name-error" messages={state.errors.display_name} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">自己紹介</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={profile.bio ?? undefined}
          aria-invalid={state.errors.bio ? true : undefined}
          aria-describedby={state.errors.bio ? "bio-error" : undefined}
        />
        <FieldError id="bio-error" messages={state.errors.bio} />
      </div>

      {state.message && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        更新する
      </Button>
    </form>
  );
}
