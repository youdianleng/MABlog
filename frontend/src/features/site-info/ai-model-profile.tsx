"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { BenchmarkCard, RelatedModels } from "./ai-model-profile-data";
import type { ProfileView } from "./ai-models-data";
import { ModelBenchmarkCard } from "./model-benchmark-card";
import { ModelProfileHeader } from "./model-profile-header";
import { ModelProfileLimitations } from "./model-profile-limitations";
import { ModelProfileOverview } from "./model-profile-overview";
import { ModelProfilePricing } from "./model-profile-pricing";
import { ModelProfileSources } from "./model-profile-sources";
import { ModelProfileUses } from "./model-profile-uses";
import { ModelRelated } from "./model-related";

/**
 * Render a model profile: header, benchmark card, what the model can do, what people use it for,
 * pricing and limitations, related models, and sources. Every section uses recorded facts only;
 * sections without data are left out instead of being filled with placeholders.
 *
 * @param card benchmark-card rows and evidence level, built on the server by `benchmarkCard()`
 * @param related same-provider, version-history, and alternative models from `relatedModels()`
 * @param scoresEvaluated date the leaderboard scores were reviewed (from `rankings.yaml`)
 */
export function AiModelProfile({
  profile,
  card,
  related,
  scoresEvaluated,
}: {
  profile: ProfileView;
  card: BenchmarkCard;
  related: RelatedModels;
  scoresEvaluated: string;
}) {
  const { t } = useLanguage();
  const { model, placements } = profile;
  return (
    <article className="mp-page" data-accent={model.accent}>
      <div className="model-profile-back">
        {/* Unranked reviewed models are listed on the "Other models" page; go back there. */}
        {placements.length === 0 && model.file ? (
          <Link href="/ai-models/other-models">
            <ArrowLeft aria-hidden="true" />
            {t("Other models", "Otros modelos")}
          </Link>
        ) : (
          <Link href="/ai-models">
            <ArrowLeft aria-hidden="true" />
            {t("All AI rankings", "Todas las clasificaciones")}
          </Link>
        )}
      </div>
      <ModelProfileHeader
        profile={profile}
        newer={
          related.sameProvider.find(/** The newer release. */ (item) => item.relation === "newer")
            ?.model
        }
      />
      <div className="mp-columns">
        <ModelBenchmarkCard
          card={card}
          placements={placements}
          checkedAt={model.file?.checkedAt ?? scoresEvaluated}
        />
        <ModelProfileOverview model={model} />
      </div>
      <ModelProfileUses model={model} />
      <div className="mp-columns">
        <ModelProfilePricing profile={profile} />
        <ModelProfileLimitations profile={profile} />
      </div>
      <ModelRelated related={related} current={model.slug} />
      <ModelProfileSources model={model} />
    </article>
  );
}
