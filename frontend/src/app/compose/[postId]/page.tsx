import { Composer } from "@/features/composer/composer";
interface ComposerRouteProps { params: Promise<{ postId: string }>; }
/** Mount one post composer with route identity preserved by Next.js. */
export default async function ComposerRoute({ params }: ComposerRouteProps) { const { postId } = await params; return <Composer id={postId} />; }
