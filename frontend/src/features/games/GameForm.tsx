"use client";

import { useActionState, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createGameAction, updateGameAction } from "@/features/games/actions";
import { parseKif, type KifParseResult } from "@/features/games/kifParser";
import {
  PLATFORM_OPTIONS,
  getPlatformRatingMetric,
  getRankOptions,
  getRatingMetricLabel,
  usesRankRating,
} from "@/features/games/platforms";
import { initialGameFormState } from "@/features/games/types";
import { showErrorToast } from "@/lib/toast";
import { useActionErrorToast } from "@/lib/useActionErrorToast";
import type { Game, GameResult, PlayerSide } from "@/types/game";
import type { Opening } from "@/types/opening";
import type { Tag } from "@/types/tag";

function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function GameForm({
  openings,
  mode = "create",
  game,
  allTags,
  gameTags = [],
}: {
  openings: Opening[];
  mode?: "create" | "edit";
  game?: Game;
  allTags: Tag[];
  gameTags?: Tag[];
}) {
  const action =
    mode === "edit" && game
      ? updateGameAction.bind(null, game.id)
      : createGameAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialGameFormState
  );
  useActionErrorToast(state.message);
  const [platformId, setPlatformId] = useState(
    game ? String(game.platform_id) : ""
  );
  const [playedAt, setPlayedAt] = useState(
    game ? toDatetimeLocalValue(game.played_at) : ""
  );
  const [side, setSide] = useState<PlayerSide | "">(game?.side ?? "");
  const [opponentName, setOpponentName] = useState(game?.opponent_name ?? "");
  const [result, setResult] = useState<GameResult | "">(game?.result ?? "");
  const [kifuText, setKifuText] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    gameTags.map((tag) => tag.id)
  );

  const parsedKif = useMemo(() => parseKif(kifuText), [kifuText]);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  function applyOpponentAndResultFromKif(
    forSide: PlayerSide | "",
    kif: KifParseResult
  ) {
    if (forSide !== "sente" && forSide !== "gote") return;

    const opponentFromKif = forSide === "sente" ? kif.goteName : kif.senteName;
    if (opponentFromKif) {
      setOpponentName(opponentFromKif);
    }

    if (kif.outcome) {
      setResult(
        kif.outcome === "draw"
          ? "draw"
          : kif.outcome === `${forSide}_win`
            ? "win"
            : "lose"
      );
    }
  }

  function applyParsedKif(text: string) {
    const kif = parseKif(text);
    if (kif.playedAt) {
      setPlayedAt(kif.playedAt);
    }
    applyOpponentAndResultFromKif(side, kif);
  }

  function handleSideChange(newSide: PlayerSide | "") {
    setSide(newSide);
    applyOpponentAndResultFromKif(newSide, parsedKif);
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      setKifuText(text);
      applyParsedKif(text);
    } catch {
      showErrorToast(
        "クリップボードから読み取れませんでした。手動で貼り付けてください。"
      );
    }
  }

  const numericPlatformId = platformId ? Number(platformId) : null;
  const ratingMetric =
    numericPlatformId !== null
      ? getPlatformRatingMetric(numericPlatformId)
      : "rating";
  const ratingLabel = getRatingMetricLabel(ratingMetric);
  const showRank = numericPlatformId !== null && usesRankRating(numericPlatformId);
  const rankOptions = numericPlatformId !== null ? getRankOptions(numericPlatformId) : [];

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="kifu_text">棋譜(KIF形式)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePasteFromClipboard}
          >
            クリップボードから貼り付け
          </Button>
        </div>
        <Textarea
          id="kifu_text"
          name="kifu_text"
          rows={8}
          value={kifuText}
          onChange={(event) => {
            const text = event.target.value;
            setKifuText(text);
            applyParsedKif(text);
          }}
          placeholder="KIF形式の棋譜をここに貼り付けてください"
          aria-invalid={state.errors.kifu_text ? true : undefined}
          aria-describedby={
            state.errors.kifu_text ? "kifu_text-error" : undefined
          }
        />
        <FieldError id="kifu_text-error" messages={state.errors.kifu_text} />
        {mode === "edit" && game?.kifu_path && (
          <p className="text-xs text-muted-foreground">
            貼り付けると、登録済みの棋譜が上書きされます。
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="platform_id">対局サービス</Label>
        <Select
          id="platform_id"
          name="platform_id"
          value={platformId}
          onChange={(event) => setPlatformId(event.target.value)}
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
          value={playedAt}
          onChange={(event) => setPlayedAt(event.target.value)}
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
            value={result}
            onChange={(event) =>
              setResult(event.target.value as GameResult | "")
            }
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
            value={side}
            onChange={(event) =>
              handleSideChange(event.target.value as PlayerSide | "")
            }
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
            defaultValue={game?.my_opening_id ?? ""}
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
            defaultValue={game?.opponent_opening_id ?? ""}
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
        <Input
          id="opponent_name"
          name="opponent_name"
          maxLength={255}
          value={opponentName ?? ""}
          onChange={(event) => setOpponentName(event.target.value)}
        />
        <FieldError
          id="opponent_name-error"
          messages={state.errors.opponent_name}
        />
      </div>

      {showRank && (
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="rank_before">対局前段位</Label>
            <Select
              id="rank_before"
              name="rank_before"
              defaultValue={game?.rank_before ?? ""}
              aria-invalid={state.errors.rank_before ? true : undefined}
              aria-describedby={
                state.errors.rank_before ? "rank_before-error" : undefined
              }
            >
              <option value="">未設定</option>
              {rankOptions.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </Select>
            <FieldError id="rank_before-error" messages={state.errors.rank_before} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rank_after">対局後段位</Label>
            <Select
              id="rank_after"
              name="rank_after"
              defaultValue={game?.rank_after ?? ""}
              aria-invalid={state.errors.rank_after ? true : undefined}
              aria-describedby={
                state.errors.rank_after ? "rank_after-error" : undefined
              }
            >
              <option value="">未設定</option>
              {rankOptions.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </Select>
            <FieldError id="rank_after-error" messages={state.errors.rank_after} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opponent_rank">相手の段位</Label>
            <Select
              id="opponent_rank"
              name="opponent_rank"
              defaultValue={game?.opponent_rank ?? ""}
              aria-invalid={state.errors.opponent_rank ? true : undefined}
              aria-describedby={
                state.errors.opponent_rank ? "opponent_rank-error" : undefined
              }
            >
              <option value="">未設定</option>
              {rankOptions.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </Select>
            <FieldError
              id="opponent_rank-error"
              messages={state.errors.opponent_rank}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="rating_before">対局前{ratingLabel}</Label>
          <Input
            id="rating_before"
            name="rating_before"
            type="number"
            defaultValue={game?.rating_before ?? undefined}
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
          <Label htmlFor="rating_after">対局後{ratingLabel}</Label>
          <Input
            id="rating_after"
            name="rating_after"
            type="number"
            defaultValue={game?.rating_after ?? undefined}
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
          <Label htmlFor="opponent_rating">相手{ratingLabel}</Label>
          <Input
            id="opponent_rating"
            name="opponent_rating"
            type="number"
            defaultValue={game?.opponent_rating ?? undefined}
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
        <Label>タグ</Label>
        {allTags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            利用可能なタグがありません。タグ管理画面で作成してください。
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTag(tag.id)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant={selected ? "default" : "outline"}
                    className="h-7 px-3 py-1 text-sm"
                    style={
                      selected && tag.color
                        ? { backgroundColor: tag.color, color: "#fff" }
                        : undefined
                    }
                  >
                    {tag.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
        {selectedTagIds.map((id) => (
          <input key={id} type="hidden" name="tag_ids" value={id} />
        ))}
        {mode === "edit" &&
          gameTags.map((tag) => (
            <input
              key={tag.id}
              type="hidden"
              name="original_tag_ids"
              value={tag.id}
            />
          ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="memo">メモ</Label>
        <Textarea
          id="memo"
          name="memo"
          maxLength={2000}
          rows={4}
          defaultValue={game?.memo ?? undefined}
          aria-invalid={state.errors.memo ? true : undefined}
          aria-describedby={state.errors.memo ? "memo-error" : undefined}
        />
        <FieldError id="memo-error" messages={state.errors.memo} />
      </div>

      {state.message && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {mode === "edit" ? "更新する" : "登録する"}
      </Button>
    </form>
  );
}
