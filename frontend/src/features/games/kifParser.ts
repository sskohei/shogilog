export type KifOutcome = "sente_win" | "gote_win" | "draw";

export type KifParseResult = {
  playedAt: string | null;
  senteName: string | null;
  goteName: string | null;
  outcome: KifOutcome | null;
};

const PLAYED_AT_PATTERN =
  /^開始日時：(\d{4})\/(\d{1,2})\/(\d{1,2})\D*(\d{1,2}):(\d{2})/m;
const SENTE_NAME_PATTERN = /^先手：(.+)$/m;
const GOTE_NAME_PATTERN = /^後手：(.+)$/m;
const MOVE_LINE_PATTERN = /^\s*(\d+)\s+(.+)$/gm;

const MOVER_LOSES_KEYWORDS = ["投了", "切れ負け", "反則負け"];
const MOVER_WINS_KEYWORDS = ["反則勝ち"];
const DRAW_KEYWORDS = ["千日手", "持将棋"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parsePlayedAt(text: string): string | null {
  const match = text.match(PLAYED_AT_PATTERN);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  return `${year}-${pad(Number(month))}-${pad(Number(day))}T${pad(Number(hour))}:${pad(Number(minute))}`;
}

function parseName(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  if (!match) return null;

  const name = match[1].trim();
  return name ? name : null;
}

function parseOutcome(text: string): KifOutcome | null {
  let lastMoveNumber: number | null = null;
  let lastMoveText: string | null = null;

  for (const match of text.matchAll(MOVE_LINE_PATTERN)) {
    const moveNumber = Number(match[1]);
    if (lastMoveNumber === null || moveNumber >= lastMoveNumber) {
      lastMoveNumber = moveNumber;
      lastMoveText = match[2];
    }
  }

  if (lastMoveNumber === null || lastMoveText === null) return null;

  const moverSide: "sente" | "gote" = lastMoveNumber % 2 === 1 ? "sente" : "gote";
  const opponentSide = moverSide === "sente" ? "gote" : "sente";

  if (MOVER_LOSES_KEYWORDS.some((keyword) => lastMoveText.includes(keyword))) {
    return `${opponentSide}_win` as KifOutcome;
  }

  if (MOVER_WINS_KEYWORDS.some((keyword) => lastMoveText.includes(keyword))) {
    return `${moverSide}_win` as KifOutcome;
  }

  if (DRAW_KEYWORDS.some((keyword) => lastMoveText.includes(keyword))) {
    return "draw";
  }

  return null;
}

export function parseKif(text: string): KifParseResult {
  if (!text.trim()) {
    return { playedAt: null, senteName: null, goteName: null, outcome: null };
  }

  return {
    playedAt: parsePlayedAt(text),
    senteName: parseName(text, SENTE_NAME_PATTERN),
    goteName: parseName(text, GOTE_NAME_PATTERN),
    outcome: parseOutcome(text),
  };
}
