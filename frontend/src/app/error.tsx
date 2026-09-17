"use client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
/** Recover from an unexpected route-rendering error without reloading the site shell. */
export default function RouteError({ reset }: { error: Error; reset: () => void }) {
  const { t } = useLanguage();
  return <section className="empty" role="alert"><h1>{t("This page could not be opened", "No se pudo abrir esta página")}</h1><p>{t("Please try the request again.", "Vuelve a intentar la solicitud.")}</p><Button onClick={reset}>{t("Try again", "Reintentar")}</Button></section>;
}
