import type { Metadata } from "next";
import type { Post } from "@/lib/api";
import { requestLocale, serverApi } from "@/lib/server-api";
import { Reader } from "@/features/posts/post-reader-page";

interface PostRouteProps { params: Promise<{ postId: string }>; }
export const dynamic = "force-dynamic";

/** Build route-specific title and summary metadata when the post is readable. */
export async function generateMetadata({ params }: PostRouteProps): Promise<Metadata> {
  const { postId } = await params;
  const locale = await requestLocale();
  const post = await serverApi<Post>("/posts/" + encodeURIComponent(postId) + "?language=" + locale);
  return post ? { title: post.title || "Untitled story", description: post.summary } : { title: "Story" };
}

/** Server-render readable approved post data and retain client interactions. */
export default async function PostPage({ params }: PostRouteProps) {
  const { postId } = await params;
  const locale = await requestLocale();
  const post = await serverApi<Post>("/posts/" + encodeURIComponent(postId) + "?language=" + locale);
  return <Reader id={postId} initialPost={post ?? undefined} />;
}
