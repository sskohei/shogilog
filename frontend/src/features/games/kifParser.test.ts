import { describe, expect, it } from "vitest";

import { parseKif } from "@/features/games/kifParser";

const SAMPLE_KIF = `開始日時：2026/07/05 21:00:00
先手：Alice
後手：Bob
手合割：平手
手数----指手---------消費時間--
   1 ２六歩(27)   ( 0:03/00:00:03)
   2 ８四歩(83)   ( 0:02/00:00:02)
  87 投了           ( 0:10/00:12:34)
`;

describe("parseKif", () => {
  it("ヘッダーと終局理由(奇数手の投了)を解析できる", () => {
    const result = parseKif(SAMPLE_KIF);

    expect(result.playedAt).toBe("2026-07-05T21:00");
    expect(result.senteName).toBe("Alice");
    expect(result.goteName).toBe("Bob");
    expect(result.outcome).toBe("gote_win");
  });

  it("偶数手の投了は先手の勝ちになる", () => {
    const text = `先手：Alice\n後手：Bob\n   1 ２六歩(27)\n   2 投了\n`;

    expect(parseKif(text).outcome).toBe("sente_win");
  });

  it("反則勝ちは指し手側の勝ちになる", () => {
    const text = `先手：Alice\n後手：Bob\n   1 ２六歩(27)\n   3 反則勝ち\n`;

    expect(parseKif(text).outcome).toBe("sente_win");
  });

  it("千日手・持将棋は引き分けになる", () => {
    expect(parseKif("   1 ２六歩(27)\n   5 千日手\n").outcome).toBe("draw");
    expect(parseKif("   1 ２六歩(27)\n   5 持将棋\n").outcome).toBe("draw");
  });

  it("未知の終局理由や中断はnullのまま推測しない", () => {
    expect(parseKif("   1 ２六歩(27)\n   5 中断\n").outcome).toBeNull();
    expect(parseKif("   1 ２六歩(27)\n").outcome).toBeNull();
  });

  it("ヘッダーが無い場合はnullを返す", () => {
    const result = parseKif("   1 ２六歩(27)\n   5 投了\n");

    expect(result.playedAt).toBeNull();
    expect(result.senteName).toBeNull();
    expect(result.goteName).toBeNull();
  });

  it("日付の形式が不正な場合はplayedAtがnullになる", () => {
    const result = parseKif("開始日時：2026年7月5日\n");

    expect(result.playedAt).toBeNull();
  });

  it("駒落ち(下手/上手)は対象外で名前はnullのまま", () => {
    const result = parseKif("下手：Alice\n上手：Bob\n");

    expect(result.senteName).toBeNull();
    expect(result.goteName).toBeNull();
  });

  it("空文字列に対しては全てnullを返す", () => {
    expect(parseKif("")).toEqual({
      playedAt: null,
      senteName: null,
      goteName: null,
      outcome: null,
    });
  });
});
