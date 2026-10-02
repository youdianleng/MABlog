"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { FileSections } from "@/features/site-info/ai-model-files";

/** Render a list section, or a muted placeholder when the file has none. */
function Items({ items, empty }: { items: string[]; empty: string }) {
  return items.length ? (
    <ul>
      {items.map(
        /** Render one bullet. */ (item) => (
          <li key={item}>{item}</li>
        ),
      )}
    </ul>
  ) : (
    <p className="model-review-muted">{empty}</p>
  );
}

/**
 * The public text of a model file in English or Spanish, switchable so the reviewer can read both
 * languages (they must contain the same facts).
 */
export function ModelReviewText({
  sections,
}: {
  sections: { en: FileSections; es: FileSections };
}) {
  const { t } = useLanguage();
  const [language, setLanguage] = useState<"en" | "es">("en");
  const text = sections[language];
  const none = t("Not present.", "No incluido.");
  return (
    <section className="model-review-text" aria-label={t("Public text", "Texto público")}>
      <div className="model-review-languages" role="group" aria-label={t("Language", "Idioma")}>
        {(["en", "es"] as const).map(
          /** Render one language toggle. */ (value) => (
            <button
              key={value}
              type="button"
              aria-pressed={language === value}
              onClick={
                /** Show this language's text. */ function choose() {
                  setLanguage(value);
                }
              }
            >
              {value === "en" ? "English" : "Español"}
            </button>
          ),
        )}
      </div>
      <h3>{t("Summary", "Resumen")}</h3>
      <p>{text.summary}</p>
      <h3>{t("Description", "Descripción")}</h3>
      <p>{text.description || none}</p>
      <h3>{t("What's new", "Novedades")}</h3>
      <Items items={text.whatsNew} empty={none} />
      <h3>{t("Key capabilities", "Capacidades clave")}</h3>
      <Items items={text.capabilities} empty={none} />
      <h3>{t("Limitations", "Limitaciones")}</h3>
      <Items items={text.limitations} empty={none} />
      <h3>{t("Best for", "Ideal para")}</h3>
      <p>
        <strong>{t("Users", "Usuarios")}:</strong> {text.users}
      </p>
      <p>
        <strong>{t("Developers", "Desarrolladores")}:</strong> {text.developers}
      </p>
    </section>
  );
}
