"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createGameAction } from "@/features/games/actions";
import { PLATFORM_OPTIONS } from "@/features/games/platforms";
import { initialGameFormState } from "@/features/games/types";
import type { Opening } from "@/types/opening";

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {messages[0]}
    </p>
  );
}

export function GameForm({ openings }: { openings: Opening[] }) {
  const [state, formAction, pending] = useActionState(
    createGameAction,
    initialGameFormState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="platform_id">対局サービス</Label>
        <Select
          id="platform_id"
          name="platform_id"
          defaultValue=""
          aria-invalid={state.errors.platform_id ? true : undefined}
          aria-describedby={
            state.errors.platform_id ? "platform_id-error" : undefined
          }
        >
          <option value="" disabled>
            選択してください
          </option>
          {PLATFORM_OPTIONS.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </Select>
        <FieldError id="platform_id-error" messages={state.errors.platform_id} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="played_at">対局日時</Label>
        <Input
          id="played_at"
          name="played_at"
          type="datetime-local"
          aria-invalid={state.errors.played_at ? true : undefined}
          aria-describedby={state.errors.played_at ? "played_at-error" : undefined}
        />
        <FieldError id="played_at-error" messages={state.errors.played_at} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="result">結果</Label>
          <Select
            id="result"
            name="result"
            defaultValue=""
            aria-invalid={state.errors.result ? true : undefined}
            aria-describedby={state.errors.result ? "result-error" : undefined}
          >
            <option value="" disabled>
              選択してください
            </option>
            <option value="win">勝ち</option>
            <option value="lose">負け</option>
            <option value="draw">引き分け</option>
          </Select>
          <FieldError id="result-error" messages={state.errors.result} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="side">手番</Label>
          <Select
            id="side"
            name="side"
            defaultValue=""
            aria-invalid={state.errors.side ? true : undefined}
            aria-describedby={state.errors.side ? "side-error" : undefined}
          >
            <option value="" disabled>
              選択してください
            </option>
            <option value="sente">先手</option>
            <option value="gote">後手</option>
          </Select>
          <FieldError id="side-error" messages={state.errors.side} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="my_opening_id">自分の戦法</Label>
          <Select
            id="my_opening_id"
            name="my_opening_id"
            defaultValue=""
            aria-invalid={state.errors.my_opening_id ? true : undefined}
            aria-describedby={
              state.errors.my_opening_id ? "my_opening_id-error" : undefined
            }
          >
            <option value="">未設定</option>
            {openings.map((opening) => (
              <option key={opening.id} value={opening.id}>
                {opening.name}
              </option>
            ))}
          </Select>
          <FieldError
            id="my_opening_id-error"
            messages={state.errors.my_opening_id}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opponent_opening_id">相手の戦法</Label>
          <Select
            id="opponent_opening_id"
            name="opponent_opening_id"
            defaultValue=""
            aria-invalid={state.errors.opponent_opening_id ? true : undefined}
            aria-describedby={
              state.errors.opponent_opening_id
                ? "opponent_opening_id-error"
                : undefined
            }
          >
            <option value="">未設定</option>
            {openings.map((opening) => (
              <option key={opening.id} value={opening.id}>
                {opening.name}
              </option>
            ))}
          </Select>
          <FieldError
            id="opponent_opening_id-error"
            messages={state.errors.opponent_opening_id}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="opponent_name">対戦相手</Label>
        <Input id="opponent_name" name="opponent_name" maxLength={255} />
        <FieldError
          id="opponent_name-error"
          messages={state.errors.opponent_name}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="rating_before">対局前レーティング</Label>
          <Input
            id="rating_before"
            name="rating_before"
            type="number"
            aria-invalid={state.errors.rating_before ? true : undefined}
            aria-describedby={
              state.errors.rating_before ? "rating_before-error" : undefined
            }
          />
          <FieldError
            id="rating_before-error"
            messages={state.errors.rating_before}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rating_after">対局後レーティング</Label>
          <Input
            id="rating_after"
            name="rating_after"
            type="number"
            aria-invalid={state.errors.rating_after ? true : undefined}
            aria-describedby={
              state.errors.rating_after ? "rating_after-error" : undefined
            }
          />
          <FieldError
            id="rating_after-error"
            messages={state.errors.rating_after}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opponent_rating">相手レーティング</Label>
          <Input
            id="opponent_rating"
            name="opponent_rating"
            type="number"
            aria-invalid={state.errors.opponent_rating ? true : undefined}
            aria-describedby={
              state.errors.opponent_rating ? "opponent_rating-error" : undefined
            }
          />
          <FieldError
            id="opponent_rating-error"
            messages={state.errors.opponent_rating}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memo">メモ</Label>
        <Textarea id="memo" name="memo" maxLength={2000} rows={4} />
      </div>

      {state.message && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        登録する
      </Button>
    </form>
  );
}
