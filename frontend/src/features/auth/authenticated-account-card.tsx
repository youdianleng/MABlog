"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

/** Welcome an authenticated visitor and provide the primary route into their workspace. */
export function AuthenticatedAccountCard() {
  const { t } = useLanguage();
  return (
    <section className="form-panel stack" aria-labelledby="authenticated-account-title">
      <h1 id="authenticated-account-title">{t("Welcome to your atelier", "Bienvenido a tu taller")}</h1>
      <div>
        <Button asChild>
          <Link href="/workspace">{t("Open my workspace", "Abrir mi taller")}</Link>
        </Button>
      </div>
    </section>
  );
}
