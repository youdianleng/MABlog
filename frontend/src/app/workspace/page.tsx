import type { Metadata } from "next";
import { Workspace } from "@/features/workspace/workspace-page";
export const metadata: Metadata = { title: "My atelier" };
/** Render the signed-in author's owned, shared, and review queues. */
export default function WorkspaceRoute() { return <Workspace />; }
