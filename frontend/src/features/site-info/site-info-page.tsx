"use client";

import { useLanguage } from "@/lib/i18n";

export type LocalizedText = {
  en: string;
  es: string;
};

export type InfoSection = {
  title: LocalizedText;
  body: LocalizedText;
  items?: LocalizedText[];
};

type SiteInfoPageProps = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  intro: LocalizedText;
  sections: InfoSection[];
  note?: LocalizedText;
};

/** Render a bilingual editorial information page using the active interface locale. */
export function SiteInfoPage({ eyebrow, title, intro, sections, note }: SiteInfoPageProps) {
  const { t } = useLanguage();

  /** Render one section and any concise supporting points. */
  function renderSection(section: InfoSection) {
    return (
      <section className="info-section" key={section.title.en}>
        <h2>{t(section.title.en, section.title.es)}</h2>
        <p>{t(section.body.en, section.body.es)}</p>
        {section.items ? (
          <ul>
            {section.items.map(
              /** Localize each supporting point without altering authored story content. */
              function renderItem(item) {
                return <li key={item.en}>{t(item.en, item.es)}</li>;
              },
            )}
          </ul>
        ) : null}
      </section>
    );
  }

  return (
    <article className="info-page">
      <header className="info-hero">
        <p className="eyebrow">{t(eyebrow.en, eyebrow.es)}</p>
        <h1>{t(title.en, title.es)}</h1>
        <p>{t(intro.en, intro.es)}</p>
      </header>
      <div className="info-sections">{sections.map(renderSection)}</div>
      {note ? <aside className="info-note">{t(note.en, note.es)}</aside> : null}
    </article>
  );
}
