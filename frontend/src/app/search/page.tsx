import type { Metadata } from "next";
import { SearchPage } from "@/features/search";
export const metadata: Metadata = { title: "Search", description: "Find accessible MAblog stories with keyword and semantic retrieval." };
/** Render one independent search workspace. */
export default function SearchRoute() { return <SearchPage />; }
