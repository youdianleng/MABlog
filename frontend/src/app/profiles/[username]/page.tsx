import type { Metadata } from "next";
import type { Post, Profile } from "@/lib/api";
import { serverApi } from "@/lib/server-api";
import { ProfilePage } from "@/features/profile/profile-page";

interface ProfileRouteProps { params: Promise<{ username: string }>; }
export const dynamic = "force-dynamic";

/** Build public author metadata from the readable profile response. */
export async function generateMetadata({ params }: ProfileRouteProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await serverApi<Profile & { posts: Post[] }>("/profiles/" + encodeURIComponent(username));
  return profile ? { title: profile.display_name || "@" + profile.username, description: profile.bio } : { title: "Profile" };
}

/** Server-render a public author biography and approved post collection. */
export default async function PublicProfilePage({ params }: ProfileRouteProps) {
  const { username } = await params;
  const profile = await serverApi<Profile & { posts: Post[] }>("/profiles/" + encodeURIComponent(username));
  return <ProfilePage username={username} initialProfile={profile ?? undefined} />;
}
