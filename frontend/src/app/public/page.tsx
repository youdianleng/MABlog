import type { Metadata } from "next";
import type { Post } from "@/lib/api";
import { requestLocale, serverApi } from "@/lib/server-api";
import { Home } from "@/features/home/home-page";
import { PUBLIC_POST_BATCH_SIZE } from "@/features/posts/pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The collection", description: "Browse approved public stories by category." };

/** Server-render the first public collection batch before infinite loading hydrates. */
export default async function PublicCollectionPage() {
  const locale = await requestLocale();
  const posts = await serverApi<Post[]>("/posts?language=" + locale + "&limit=" + PUBLIC_POST_BATCH_SIZE);
  return <Home publicOnly initialPosts={posts ?? undefined} />;
}
