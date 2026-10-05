"use client";

import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { isPublishedPrice } from "./ai-model-benchmark-context";
import { FILE_CATEGORIES, filePriceText } from "./ai-model-file-labels";
import type { ModelFile } from "./ai-model-files";
import { profileCategory, providerInitials } from "./ai-model-profile-data";
import type { ModelView, ProfileView } from "./ai-models-data";
import { categoryName } from "./model-profile-labels";
import { accessTranslations } from "./ranking-labels";

const STATUS_LABELS: Record<ModelFile["status"], [string, string]> = {
  generally_available: ["Generally available", "Disponible de forma general"],
  preview: ["Preview", "Vista previa"],
  beta: ["Beta", "Beta"],
  deprecated: ["Deprecated", "Obsoleto"],
  retired: ["Retired", "Retirado"],
};

/**
 * Profile header: provider badge, name, category and release facts, access routes, the headline
 * price, the official link, and a box with the model's best leaderboard placement (or why it is
 * not ranked). A newer release of the same line is announced right under the name.
 */
export function ModelProfileHeader({
  profile,
  newer,
}: {
  profile: ProfileView;
  /** The newer release of this line, when it has a published profile (shown by name). */
  newer?: ModelView;
}) {
  const { locale, t } = useLanguage();
  const spanish = locale === "es";
  const { model, placements } = profile;
  const file = model.file;
  const category = FILE_CATEGORIES.find(
    /** This profile's category label. */ (entry) => entry.id === profileCategory(profile),
  );
  const best = [...placements].sort(
    /** Lowest rank first. */ (a, b) => a.placement.rank - b.placement.rank,
  )[0];
  const filePrice = file?.pricing[0];
  const price = filePrice
    ? filePriceText(filePrice, spanish)
    : best && isPublishedPrice(best.price)
      ? best.price.display
      : null;
  const hasIndependent = file?.benchmarks.some(
    /** Any independent result. */ (benchmark) => benchmark.kind === "independent",
  );
  return (
    <header className="mp-header" data-accent={model.accent}>
      <div className="mp-identity">
        <span className="mp-badge" aria-hidden="true">
          {providerInitials(model.provider)}
        </span>
        <div>
          <p className="mp-meta">
            <strong>{model.provider}</strong>
            {category ? <span>{t(category.name.en, category.name.es)}</span> : null}
            {file?.releaseDate ? (
              <span>
                {t("Released", "Lanzado")} {file.releaseDate}
              </span>
            ) : null}
          </p>
          <h1>{model.name}</h1>
          {file?.supersededBy ? (
            <p className="mp-newer" role="note">
              {t("A newer release is available:", "Hay una versión más reciente:")}{" "}
              <Link href={`/ai-models/${file.supersededBy}`}>
                {newer?.name ?? file.supersededBy}
              </Link>
            </p>
          ) : null}
          <div className="mp-chips">
            {file ? (
              <span className="mp-chip mp-chip-status">{t(...STATUS_LABELS[file.status])}</span>
            ) : null}
            {model.access.map(
              /** One access route in the current language. */ (access) => (
                <span key={access} className="mp-chip">
                  {t(access, accessTranslations[access])}
                </span>
              ),
            )}
          </div>
          <p className="mp-price">
            <span>{t("Price", "Precio")}</span>
            {price ?? t("Not published", "No publicado")}
          </p>
          <a className="mp-official" href={model.officialUrl} target="_blank" rel="noreferrer">
            {t("Official page", "Página oficial")} <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
      <aside className="mp-placement" aria-label={t("Ranking", "Clasificación")}>
        <Trophy aria-hidden="true" />
        {best ? (
          <>
            <p className="mp-placement-rank">#{best.placement.rank}</p>
            <p className="mp-placement-category">{categoryName(best.category, spanish)}</p>
            <p className="mp-placement-score">
              {best.placement.score} <small>{best.placement.metric}</small>
            </p>
            <p className="mp-placement-note">
              {t("Source rank", "Rango en la fuente")} {best.placement.sourceRank}
            </p>
          </>
        ) : (
          <>
            <p className="mp-placement-rank mp-placement-none">
              {t("Not ranked yet", "Aún sin clasificar")}
            </p>
            <p className="mp-placement-note">
              {hasIndependent
                ? t(
                    "Has independent results, but is not in this edition's Top 5.",
                    "Tiene resultados independientes, pero no está en el Top 5 de esta edición.",
                  )
                : t(
                    "Rankings need an independent leaderboard score; none is recorded yet.",
                    "Las clasificaciones necesitan una puntuación independiente; todavía no hay ninguna.",
                  )}
            </p>
          </>
        )}
      </aside>
    </header>
  );
}
