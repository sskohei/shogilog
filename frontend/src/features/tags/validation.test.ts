import { describe, expect, it } from "vitest";

import { validateTagInput } from "@/features/tags/validation";

describe("validateTagInput", () => {
  it("タグ名が空の場合はエラーになる", () => {
    const errors = validateTagInput({ name: "", color: null });

    expect(errors.name).toBeDefined();
  });

  it("タグ名が255文字を超える場合はエラーになる", () => {
    const errors = validateTagInput({ name: "あ".repeat(256), color: null });

    expect(errors.name).toBeDefined();
  });

  it("色が未入力の場合はエラーにならない", () => {
    const errors = validateTagInput({ name: "研究", color: "" });

    expect(errors.color).toBeUndefined();
  });

  it("色が正しいhex形式の場合はエラーにならない", () => {
    const errors = validateTagInput({ name: "研究", color: "#ff0000" });

    expect(errors.color).toBeUndefined();
  });

  it("色がhex形式でない場合はエラーになる", () => {
    const errors = validateTagInput({ name: "研究", color: "red" });

    expect(errors.color).toBeDefined();
  });

  it("有効な入力の場合はエラーが無い", () => {
    const errors = validateTagInput({ name: "研究", color: "#00ff00" });

    expect(errors).toEqual({});
  });
});
