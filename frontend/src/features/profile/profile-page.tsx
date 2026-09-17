"use client";
import { type Post, type Profile } from "@/lib/api";
import { useData } from "@/hooks/use-data";
import { Loading } from "@/components/feedback/loading";
import { Avatar, PostGrid } from "@/features/posts";

interface ProfilePageProps {
  username: string;
  initialProfile?: Profile & { posts: Post[] };
}

/** Show a server-seeded public biography and approved posts for an author. */
export function ProfilePage({ username, initialProfile }: ProfilePageProps) {
  const { data, error } = useData<Profile & { posts: Post[] }>(
    "/profiles/" + encodeURIComponent(username),
    0,
    initialProfile,
  );
  if (!data) return <Loading error={error} />;
  return (
    <>
      <div className="profile-banner">
        <Avatar user={data} />
        <div>
          <div className="eyebrow">@{data.username}</div>
          <h1>{data.display_name}</h1>
          <p>{data.bio}</p>
        </div>
      </div>
      <PostGrid posts={data.posts} />
    </>
  );
}
