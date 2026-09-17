import { Sharing } from "@/features/sharing/sharing-page";
interface SharingRouteProps { params: Promise<{ postId: string }>; }
/** Render creator-managed per-post access grants. */
export default async function SharingRoute({ params }: SharingRouteProps) { const { postId } = await params; return <Sharing id={postId} />; }
