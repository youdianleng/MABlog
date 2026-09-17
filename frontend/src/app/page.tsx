import type { Post } from "@/lib/api";
import { requestLocale, serverApi } from "@/lib/server-api";
import { Home } from "@/features/home/home-page";
import { PUBLIC_POST_BATCH_SIZE } from "@/features/posts/pagination";

export const dynamic = "force-dynamic";

/** Server-render the discovery page before its interactive carousel hydrates. */
export default async function DiscoverPage() {
  const locale = await requestLocale();
  const [posts, featured] = await Promise.all([
    serverApi<Post[]>("/posts?language=" + locale + "&limit=" + PUBLIC_POST_BATCH_SIZE),
    serverApi<Post[]>("/carousel?language=" + locale),
  ]);
  return <Home publicOnly={false} initialPosts={posts ?? undefined} initialFeatured={featured ?? undefined} />;
}
