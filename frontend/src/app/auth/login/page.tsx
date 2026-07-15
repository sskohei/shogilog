import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "ログイン | ShogiLog",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-xl font-semibold">ログイン</h1>
        <LoginForm />
      </div>
    </div>
  );
}
