"use client";

import { Code2, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { ModelView } from "./ai-models-data";

/** One audience column: its verdict as a heading line, then concrete uses when the file has them. */
function Audience({
  icon,
  title,
  verdict,
  uses,
}: {
  icon: React.ReactNode;
  title: string;
  verdict: string;
  uses: string[];
}) {
  return (
    <article className="mp-audience">
      <h3>
        {icon}
        {title}
      </h3>
      <p>{verdict}</p>
      {uses.length ? (
        <ul>
          {uses.map(
            /** One concrete use. */ (use) => (
              <li key={use}>{use}</li>
            ),
          )}
        </ul>
      ) : null}
    </article>
  );
}

/**
 * "What people use it for": the user and developer verdicts, each followed by the file's
 * "Common uses" bullets when that optional section exists.
 */
export function ModelProfileUses({ model }: { model: ModelView }) {
  const { locale, t } = useLanguage();
  const language = locale === "es" ? "es" : "en";
  const uses = model.file?.commonUses[language] ?? { users: [], developers: [] };
  return (
    <section className="mp-panel mp-uses" aria-labelledby="mp-uses-title">
      <p className="eyebrow">{t("IN PRACTICE", "EN LA PRÁCTICA")}</p>
      <h2 id="mp-uses-title">{t("What people use it for", "Para qué se usa")}</h2>
      <div className="mp-audiences">
        <Audience
          icon={<UserRound aria-hidden="true" />}
          title={t("Users", "Usuarios")}
          verdict={t(model.userVerdict.en, model.userVerdict.es)}
          uses={uses.users}
        />
        <Audience
          icon={<Code2 aria-hidden="true" />}
          title={t("Developers", "Desarrolladores")}
          verdict={t(model.developerVerdict.en, model.developerVerdict.es)}
          uses={uses.developers}
        />
      </div>
    </section>
  );
}
