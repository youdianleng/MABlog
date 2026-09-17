"use client";
import { useLanguage } from "@/lib/i18n";

/** Show localized loading text or a concrete API error. */
export function Loading({ error = "" }: { error?: string }) {
  const { t } = useLanguage();
  return <div className={error ? "notice error" : "notice"}>{error || t("Opening the scroll…", "Abriendo el pergamino…")}</div>;
}
