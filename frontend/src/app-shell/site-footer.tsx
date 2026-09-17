"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, LockKeyhole, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

type SiteFooterProps = {
  showCallout: boolean;
};

/** Render MAblog's public discovery callout and persistent production navigation. */
export function SiteFooter({ showCallout }: SiteFooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      {showCallout ? (
        <section className="footer-callout" aria-labelledby="footer-callout-title">
          <div className="footer-orbit" aria-hidden="true"><span /><i>✦</i><b>✧</b></div>
          <p className="eyebrow">{t("The collection is always growing", "La colección siempre está creciendo")}</p>
          <h2 id="footer-callout-title">{t("Find a story worth carrying with you.", "Encuentra una historia que quieras llevar contigo.")}</h2>
          <p className="footer-callout-copy">
            {t(
              "Step beyond the ordinary into public journals, imagined worlds, and quiet discoveries shared by the MAblog community.",
              "Da un paso más allá de lo cotidiano y descubre diarios públicos, mundos imaginados y hallazgos compartidos por la comunidad de MAblog.",
            )}
          </p>
          <Button asChild size="lg" className="footer-callout-action">
            <Link href="/public">{t("Enter the collection", "Entrar en la colección")}<ArrowRight aria-hidden="true" /></Link>
          </Button>
          <ul className="footer-value-list" aria-label={t("What MAblog offers", "Lo que ofrece MAblog")}>
            <li><BookOpenText aria-hidden="true" />{t("Living stories", "Historias vivas")}</li>
            <li><Sparkles aria-hidden="true" />{t("Freeform ateliers", "Talleres libres")}</li>
            <li><LockKeyhole aria-hidden="true" />{t("Creator-led sharing", "Compartir bajo control del autor")}</li>
            <li><Search aria-hidden="true" />{t("Grounded discovery", "Descubrimiento fundamentado")}</li>
          </ul>
        </section>
      ) : null}

      <div className="footer-navigation">
        <div className="footer-navigation-inner">
          <div className="footer-brand-column">
            <Link href="/" className="footer-brand" aria-label={t("MAblog home", "Inicio de MAblog")}>
              <span className="footer-seal" aria-hidden="true">M</span>
              <span>MAblog</span>
            </Link>
            <p>{t("A home for imagined worlds, personal journals, and stories made together.", "Un hogar para mundos imaginados, diarios personales e historias creadas en compañía.")}</p>
          </div>

          <nav className="footer-link-groups" aria-label={t("Footer navigation", "Navegación del pie de página")}>
            <section aria-labelledby="footer-explore-heading">
              <h3 id="footer-explore-heading">{t("Explore", "Explorar")}</h3>
              <Link href="/">{t("Discover", "Descubrir")}</Link>
              <Link href="/public">{t("The collection", "La colección")}</Link>
              <Link href="/search">{t("Search stories", "Buscar historias")}</Link>
            </section>
            <section aria-labelledby="footer-create-heading">
              <h3 id="footer-create-heading">{t("Create", "Crear")}</h3>
              <Link href="/workspace">{t("My atelier", "Mi taller")}</Link>
              <Link href="/profile">{t("My profile", "Mi perfil")}</Link>
              <Link href="/account">{t("Account & access", "Cuenta y acceso")}</Link>
            </section>
            <section aria-labelledby="footer-mablog-heading">
              <h3 id="footer-mablog-heading">MAblog</h3>
              <Link href="/about">{t("About", "Acerca de")}</Link>
              <Link href="/help">{t("Help center", "Centro de ayuda")}</Link>
              <Link href="/guidelines">{t("Community guidelines", "Normas de la comunidad")}</Link>
            </section>
            <section aria-labelledby="footer-legal-heading">
              <h3 id="footer-legal-heading">{t("Legal", "Legal")}</h3>
              <Link href="/privacy">{t("Privacy", "Privacidad")}</Link>
              <Link href="/terms">{t("Terms", "Términos")}</Link>
            </section>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MAblog</span>
          <span>{t("Made for stories beyond the ordinary.", "Creado para historias más allá de lo cotidiano.")}</span>
        </div>
      </div>
    </footer>
  );
}
