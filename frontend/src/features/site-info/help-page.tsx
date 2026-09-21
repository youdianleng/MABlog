"use client";

import Link from "next/link";
import { CircleHelp, FilePenLine, Search, Send, ShieldCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

/** Present MAblog's core workflows as a bilingual, route-specific help center. */
export function HelpPageContent() {
  const { t } = useLanguage();

  return (
    <article className="help-page">
      <div className="help-frame">
        <section className="help-hero" aria-labelledby="help-title">
          <div className="help-hero-copy">
            <div className="help-desk-mark"><span className="seal">M</span><span><strong>{t("Help desk", "Centro de ayuda")}</strong><small>MAblog</small></span></div>
            <div>
              <p className="eyebrow">{t("HELP CENTER", "CENTRO DE AYUDA")}</p>
              <h1 id="help-title">{t("From first line to shared story.", "De la primera línea a la historia compartida.")}</h1>
            </div>
            <div className="help-hero-intro">
              <p>{t(
                "Find the shortest path through writing, access, review, and publication. Your work stays private until you choose the people—or the audience—who can see it.",
                "Encuentra el camino más directo para escribir, dar acceso, revisar y publicar. Tu trabajo sigue siendo privado hasta que eliges a las personas —o la audiencia— que pueden verlo.",
              )}</p>
              <div className="help-hero-actions">
                <Button asChild><Link href="/workspace">{t("Open my atelier", "Abrir mi taller")}</Link></Button>
                <Button asChild variant="outline"><Link href="/search">{t("Find an answer", "Buscar una respuesta")}</Link></Button>
              </div>
            </div>
            <p className="help-language-note"><CircleHelp aria-hidden="true" />{t("Guided in English and Spanish", "Guías en español e inglés")}</p>
          </div>

          <div className="help-workflow-panel">
            <div className="help-workflow-heading">
              <div><p className="eyebrow">{t("THE MABLOG PATH", "EL RECORRIDO MABLOG")}</p><h2>{t("One protected path from draft to readers.", "Un recorrido protegido del borrador a los lectores.")}</h2></div>
              <span>01—03</span>
            </div>

            <div className="help-workflow-list">
              <article><span>01</span><FilePenLine aria-hidden="true" /><div><h3>{t("Draft privately", "Crea en privado")}</h3><p>{t("Write and arrange the story before anyone else sees it.", "Escribe y organiza la historia antes de que nadie más la vea.")}</p></div></article>
              <article><span>02</span><UsersRound aria-hidden="true" /><div><h3>{t("Invite and review", "Invita y revisa")}</h3><p>{t("Give one person the access they need; proposed edits wait for you.", "Da a cada persona el acceso que necesita; los cambios propuestos esperan tu decisión.")}</p></div></article>
              <article><span>03</span><Send aria-hidden="true" /><div><h3>{t("Publish deliberately", "Publica con intención")}</h3><p>{t("Move the finished version into the public collection only when it is ready.", "Lleva la versión terminada a la colección pública solo cuando esté lista.")}</p></div></article>
            </div>

            <nav className="help-topic-grid" aria-label={t("Help topics", "Temas de ayuda")}>
              <span>{t("QUICK PATHS", "ACCESOS RÁPIDOS")}</span>
              <Link href="/workspace">{t("Writing", "Escritura")} <span aria-hidden="true">↗</span></Link>
              <Link href="/workspace">{t("Sharing", "Compartir")} <span aria-hidden="true">↗</span></Link>
              <Link href="/workspace">{t("Publishing", "Publicación")} <span aria-hidden="true">↗</span></Link>
              <Link href="/public">{t("Discovery", "Descubrimiento")} <span aria-hidden="true">↗</span></Link>
              <Link href="/search"><Search aria-hidden="true" />{t("Search help", "Buscar ayuda")}</Link>
            </nav>
          </div>
        </section>
      </div>

      <aside className="help-local-note" aria-label={t("Local email note", "Nota sobre el correo local")}>
        <ShieldCheck aria-hidden="true" />
        <div><strong>{t("Testing account email locally?", "¿Probando el correo de cuenta en local?")}</strong><p>{t("Verification and recovery messages are captured in Mailpit at localhost:8025. A production deployment should connect a monitored support address and transactional email provider.", "Los mensajes de verificación y recuperación se capturan en Mailpit en localhost:8025. Un despliegue en producción debe conectar una dirección de soporte supervisada y un proveedor de correo transaccional.")}</p></div>
      </aside>
    </article>
  );
}
