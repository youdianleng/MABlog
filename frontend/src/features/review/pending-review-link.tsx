import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

interface PendingReviewLinkProps {
  postId: string;
  pendingCount: number;
}

/** Render the Review action with a creator-visible pending-decision badge. */
export function PendingReviewLink({
  postId,
  pendingCount,
}: PendingReviewLinkProps) {
  const { t } = useLanguage();
  const pendingLabel =
    pendingCount === 1
      ? t("1 review pending", "1 revisión pendiente")
      : t(
          `${pendingCount} reviews pending`,
          `${pendingCount} revisiones pendientes`,
        );

  return (
    <Button asChild variant="outline">
      <Link
        className="pending-review-link"
        href={`/review/${postId}`}
        aria-label={
          pendingCount > 0
            ? `${t("Review", "Revisar")}, ${pendingLabel}`
            : t("Review", "Revisar")
        }
      >
        <span>{t("Review", "Revisar")}</span>
        {pendingCount > 0 ? (
          <span className="pending-review-badge" aria-hidden="true">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
