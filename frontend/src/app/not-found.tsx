import Link from "next/link";
/** Return a real 404 view for routes that MAblog does not define. */
export default function NotFound() {
  return <section className="empty"><div className="eyebrow">404</div><h1>Story path not found</h1><p>The page may have moved or is no longer available.</p><Link href="/">Return to discovery ↗</Link></section>;
}
