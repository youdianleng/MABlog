import { redirect } from "next/navigation";
import type { Post, PublicPostPage } from "@/lib/api";
import { requestLocale, serverApi } from "@/lib/server-api";
import { Home } from "@/features/home/home-page";
import { parsePublicPostPage, PUBLIC_POST_PAGE_SIZE } from "@/features/posts/pagination";

export const dynamic = "force-dynamic";

interface DiscoverPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

/** Server-render the selected discovery page before its interactive carousel hydrates. */
export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const locale = await requestLocale();
  const page = parsePublicPostPage((await searchParams).page);
  const [postPage, featured] = await Promise.all([
    serverApi<PublicPostPage>("/posts/page?language=" + locale + "&page=" + page + "&page_size=" + PUBLIC_POST_PAGE_SIZE),
    serverApi<Post[]>("/carousel?language=" + locale),
  ]);
  if (postPage && page > postPage.pages) redirect(postPage.pages > 1 ? "/?page=" + postPage.pages : "/");
  return <Home publicOnly={false} initialPage={postPage ?? undefined} initialFeatured={featured ?? undefined} />;
}
