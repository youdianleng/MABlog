import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { PublicPostPage } from "@/lib/api";
import { parsePostCategory } from "@/lib/categories";
import { requestLocale, serverApi } from "@/lib/server-api";
import { Home } from "@/features/home/home-page";
import { parsePublicPostPage, PUBLIC_POST_PAGE_SIZE } from "@/features/posts/pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The collection", description: "Browse approved public stories by category." };

interface PublicCollectionPageProps {
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
}

/** Server-render one filtered public collection page with shareable URL state. */
export default async function PublicCollectionPage({ searchParams }: PublicCollectionPageProps) {
  const locale = await requestLocale();
  const parameters = await searchParams;
  const page = parsePublicPostPage(parameters.page);
  const category = parsePostCategory(parameters.category);
  const query = new URLSearchParams({ language: locale, page: String(page), page_size: String(PUBLIC_POST_PAGE_SIZE) });
  if (category) query.set("category", category);
  const postPage = await serverApi<PublicPostPage>("/posts/page?" + query.toString());
  if (postPage && page > postPage.pages) {
    const canonical = new URLSearchParams();
    if (category) canonical.set("category", category);
    if (postPage.pages > 1) canonical.set("page", String(postPage.pages));
    redirect("/public" + (canonical.size ? "?" + canonical.toString() : ""));
  }
  return <Home publicOnly initialPage={postPage ?? undefined} category={category} />;
}
