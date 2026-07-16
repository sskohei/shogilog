import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

// recharts の ResponsiveContainer は ResizeObserver と getBoundingClientRect で
// 描画サイズを決定するが、jsdom はどちらも実サイズを返さないためテスト用に補う。
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

Element.prototype.getBoundingClientRect = () =>
  ({
    width: 600,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 600,
    x: 0,
    y: 0,
    toJSON() {},
  }) as DOMRect;

afterEach(() => {
  cleanup();
});
