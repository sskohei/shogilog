import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { createServerClientMock, getUserMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

import { updateSession } from "@/lib/supabase/proxy";

describe("updateSession", () => {
  beforeEach(() => {
    createServerClientMock.mockReset();
    getUserMock.mockReset();
    createServerClientMock.mockReturnValue({ auth: { getUser: getUserMock } });
  });

  it("未ログインで保護ルートにアクセスするとログインページへリダイレクトする", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const request = new NextRequest("http://localhost:3000/games");

    const response = await updateSession(request);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/login"
    );
  });

  it("ログイン済みでログインページにアクセスすると /games へリダイレクトする", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    const request = new NextRequest("http://localhost:3000/auth/login");

    const response = await updateSession(request);

    expect(response.headers.get("location")).toBe("http://localhost:3000/games");
  });

  it("ログイン済みでサインアップページにアクセスすると /games へリダイレクトする", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    const request = new NextRequest("http://localhost:3000/auth/signup");

    const response = await updateSession(request);

    expect(response.headers.get("location")).toBe("http://localhost:3000/games");
  });

  it("保護されていないルートかつ未ログインの場合はそのまま通す", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const request = new NextRequest("http://localhost:3000/");

    const response = await updateSession(request);

    expect(response.headers.get("location")).toBeNull();
  });
});
