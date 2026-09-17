import type { Metadata } from "next";
import { AiNewsPage } from "@/features/ai-news/ai-news-page";
export const metadata: Metadata = { title: "AI newsroom" };
/** Render the protected weekly AI-news administration workspace. */
export default function AiNewsAdministrationRoute() { return <AiNewsPage />; }
