"use client";

import Link from "next/link";
import { ArrowUpRight, AudioLines, Braces, Image as ImageIcon, Music2, Video } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { filePriceText, titleTagline } from "./ai-model-file-labels";
import type { ModelFile } from "./ai-model-files";
import type { ModelView } from "./ai-models-data";
import { accessTranslations } from "./ranking-labels";

/** Decorative icon for a file category; hidden from assistive technology. */
export function FileCategoryIcon({ category }: { category: ModelFile["category"] }) {
  if (category === "llm-agents") return <Braces aria-hidden="true" />;
  if (category === "image") return <ImageIcon aria-hidden="true" />;
  if (category === "video") return <Video aria-hidden="true" />;
  if (category === "music") return <Music2 aria-hidden="true" />;
  return <AudioLines aria-hidden="true" />;
}

/**
 * One unranked, reviewed model: provider, name, the descriptive part of its title, release date,
 * access routes, first published price, and a link to its full profile. A release with a newer
 * version is marked so readers can jump to the current one.
 *
 * @param model a model view backed by a reviewed file (`model.file` is not null)
 */
export function OtherModelCard({ model }: { model: ModelView }) {
  const { locale, t } = useLanguage();
  const file = model.file;
  if (!file) return null;
  const spanish = locale === "es";
  const price = file.pricing[0];
  return (
    <li className="other-model-card" data-accent={model.accent}>
      <div className="other-model-head">
        <span className="other-model-swatch" aria-hidden="true">
          <FileCategoryIcon category={file.category} />
        </span>
        <div>
          <p className="other-model-provider">{model.provider}</p>
          <h3>
            <Link href={`/ai-models/${model.slug}`}>{model.name}</Link>
          </h3>
        </div>
      </div>
      <p className="other-model-tagline">{titleTagline(t(file.title.en, file.title.es))}</p>
      <dl className="other-model-facts">
        <div>
          <dt>{t("Released", "Lanzamiento")}</dt>
          <dd>{file.releaseDate ?? t("Not published", "No publicado")}</dd>
        </div>
        <div>
          <dt>{t("Price", "Precio")}</dt>
          <dd>{price ? filePriceText(price, spanish) : t("Not published", "No publicado")}</dd>
        </div>
      </dl>
      <div className="other-model-access">
        {model.access.map(
          /** Translate one access route for the current language. */ (access) => (
            <span key={access}>{t(access, accessTranslations[access])}</span>
          ),
        )}
      </div>
      {file.supersededBy ? (
        <p className="other-model-superseded">
          {t("Newer release:", "Versión más reciente:")}{" "}
          <Link href={`/ai-models/${file.supersededBy}`}>{file.supersededBy}</Link>
        </p>
      ) : null}
      <Link className="other-model-link" href={`/ai-models/${model.slug}`}>
        {t("View profile", "Ver ficha")}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </li>
  );
}
