import { Review } from "@/features/review/review-page";
interface ReviewRouteProps { params: Promise<{ postId: string }>; }
/** Render creator proposal comparison and approval controls. */
export default async function ReviewRoute({ params }: ReviewRouteProps) { const { postId } = await params; return <Review id={postId} />; }
