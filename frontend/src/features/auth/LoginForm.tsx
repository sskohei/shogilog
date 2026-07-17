"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/features/auth/actions";
import { initialLoginFormState } from "@/features/auth/types";
import { useActionErrorToast } from "@/lib/useActionErrorToast";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialLoginFormState
  );
  useActionErrorToast(state.message);
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={state.errors.email ? true : undefined}
          aria-describedby={state.errors.email ? "email-error" : undefined}
        />
        <FieldError id="email-error" messages={state.errors.email} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          maxLength={128}
          autoComplete="current-password"
          aria-invalid={state.errors.password ? true : undefined}
          aria-describedby={state.errors.password ? "password-error" : undefined}
        />
        <FieldError id="password-error" messages={state.errors.password} />
      </div>

      {state.message && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        ログイン
      </Button>
    </form>
  );
}
