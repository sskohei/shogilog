import type { Metadata } from "next";

import { SignupForm } from "@/features/auth/SignupForm";

export const metadata: Metadata = {
  title: "アカウント登録 | ShogiLog",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-xl font-semibold">アカウント登録</h1>
        <SignupForm />
      </div>
    </div>
  );
}
