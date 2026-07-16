import type { Metadata } from "next";

import { ApiError } from "@/lib/fetcher";
import { fetchPlatformRatings, fetchProfile } from "@/services/api/profile";
import { ErrorState } from "@/features/profile/ErrorState";
import { getProfileErrorMessage } from "@/features/profile/errors";
import { PlatformRatingsSection } from "@/features/profile/PlatformRatingsSection";
import { ProfileForm } from "@/features/profile/ProfileForm";
import type { PlatformRating, Profile } from "@/types/profile";

export const metadata: Metadata = {
  title: "プロフィール | ShogiLog",
};

type ProfilePageData =
  | { ok: true; profile: Profile; platformRatings: PlatformRating[] }
  | { ok: false; message: string };

async function loadProfilePageData(): Promise<ProfilePageData> {
  try {
    const [profile, platformRatings] = await Promise.all([
      fetchProfile(),
      fetchPlatformRatings(),
    ]);
    return { ok: true, profile, platformRatings };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? getProfileErrorMessage(error)
        : "プロフィール情報の取得に失敗しました。";
    return { ok: false, message };
  }
}

export default async function ProfilePage() {
  const data = await loadProfilePageData();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-8 px-4 py-12">
      <h1 className="text-xl font-semibold">プロフィール</h1>
      {!data.ok ? (
        <ErrorState message={data.message} />
      ) : (
        <>
          <section className="space-y-2 rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium">基本情報</h2>
            <ProfileForm profile={data.profile} />
          </section>
          <PlatformRatingsSection ratings={data.platformRatings} />
        </>
      )}
    </div>
  );
}
