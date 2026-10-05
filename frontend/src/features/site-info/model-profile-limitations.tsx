"use client";

import { useLanguage } from "@/lib/i18n";
import type { ProfileView } from "./ai-models-data";

/** Limitations and caveats from the reviewed file; nothing is shown without a file. */
export function ModelProfileLimitations({ profile }: { profile: ProfileView }) {
  const { locale, t } = useLanguage();
  const items = profile.model.file?.limitations[locale === "es" ? "es" : "en"] ?? [];
  if (!items.length) return null;
  return (
    <section className="mp-panel mp-limits" aria-labelledby="mp-limits-title">
      <p className="eyebrow">{t("KNOW BEFORE YOU START", "ANTES DE EMPEZAR")}</p>
      <h2 id="mp-limits-title">{t("Limitations", "Limitaciones")}</h2>
      <ul>
        {items.map(
          /** One limitation. */ (item) => (
            <li key={item}>{item}</li>
          ),
        )}
      </ul>
    </section>
  );
}
