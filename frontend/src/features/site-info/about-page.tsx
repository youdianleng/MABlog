"use client";

import Link from "next/link";
import { BookOpenText, Cpu, Heart, Newspaper, SearchCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

/** Present MAblog's purpose, authorship principles, and story lifecycle. */
export function AboutPageContent() {
  const { t } = useLanguage();

  return (
    <article className="about-page">
      <header className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow">{t("ABOUT MABLOG · AN EDITORIAL ATELIER", "SOBRE MABLOG · UN TALLER EDITORIAL")}</p>
          <h1>{t("A home for stories that refuse to stay ordinary.", "Un hogar para historias que se niegan a ser corrientes.")}</h1>
          <p>{t(
            "Some stories begin as a private thought. Others arrive as a whole world. MAblog gives both the room to grow, the tools to invite trusted voices, and a deliberate path into public view.",
            "Algunas historias empiezan como un pensamiento privado. Otras llegan como un mundo entero. MAblog ofrece a ambas espacio para crecer, herramientas para invitar voces de confianza y un camino consciente hacia lo público.",
          )}</p>
        </div>
        <div className="about-orbit-stage" aria-hidden="true">
          <span className="about-orbit about-orbit-outer" />
          <span className="about-orbit about-orbit-inner" />
          <span className="about-orbit-star about-orbit-star-one">✦</span>
          <span className="about-orbit-star about-orbit-star-two">✧</span>
          <span className="about-orbit-seal">M</span>
          <small>{t("Stories made together", "Historias creadas en compañía")}</small>
        </div>
      </header>

      <section className="about-manifesto" aria-labelledby="about-manifesto-title">
        <p className="eyebrow">{t("WHY WE EXIST", "POR QUÉ EXISTIMOS")}</p>
        <h2 id="about-manifesto-title">{t("Writing needs room before it needs an audience.", "La escritura necesita espacio antes que audiencia.")}</h2>
        <p>{t(
          "We built MAblog around a simple boundary: creation is private until the author chooses otherwise. That boundary makes experimentation safer, collaboration clearer, and publication more meaningful.",
          "Creamos MAblog alrededor de un límite sencillo: la creación es privada hasta que el autor decide lo contrario. Ese límite hace que experimentar sea más seguro, colaborar más claro y publicar más significativo.",
        )}</p>
      </section>

      <section className="about-content" aria-labelledby="about-content-title">
        <div className="about-content-heading">
          <div>
            <p className="eyebrow">{t("WHAT YOU'LL FIND HERE", "LO QUE ENCONTRARÁS AQUÍ")}</p>
            <h2 id="about-content-title">{t("Inside MAblog", "Dentro de MAblog")}</h2>
          </div>
          <p>{t(
            "A practical mix of verified AI reporting, recent technology, and the subjects readers care enough about to turn into stories.",
            "Una mezcla práctica de información verificada sobre IA, tecnología reciente y los temas que importan lo suficiente como para convertirse en historias.",
          )}</p>
        </div>
        <div className="about-content-grid">
          <Link className="about-content-card about-content-card-news" href="/public?category=technology">
            <div className="about-content-card-top"><Newspaper aria-hidden="true" /><span>{t("WEEKLY DESK", "MESA SEMANAL")}</span></div>
            <div className="about-content-card-body">
              <p className="about-content-index">01</p>
              <h3>{t("AI news, checked against the source.", "Noticias de IA contrastadas con la fuente.")}</h3>
              <p>{t(
                "MAblog_IA turns official model releases into one evidence-checked bilingual briefing, with source links kept beside the story.",
                "MABlog_IA convierte los lanzamientos oficiales de modelos en un resumen bilingüe verificado, manteniendo las fuentes junto a la historia.",
              )}</p>
            </div>
            <ul aria-label={t("AI newsroom coverage", "Cobertura de la sala de IA")}>
              <li>{t("Model releases", "Lanzamientos de modelos")}</li>
              <li>{t("Official sources", "Fuentes oficiales")}</li>
              <li>{t("English + Spanish", "Inglés + español")}</li>
            </ul>
          </Link>

          <Link className="about-content-card about-content-card-tech" href="/public?category=technology">
            <div className="about-content-card-top"><Cpu aria-hidden="true" /><span>{t("RECENT TECHNOLOGY", "TECNOLOGÍA RECIENTE")}</span></div>
            <div className="about-content-card-body">
              <p className="about-content-index">02</p>
              <h3>{t("Technology through a human lens.", "Tecnología desde una mirada humana.")}</h3>
              <p>{t(
                "Notes on new tools, prototypes, digital culture, and the ways technology changes ordinary work and life.",
                "Notas sobre nuevas herramientas, prototipos, cultura digital y cómo la tecnología transforma el trabajo y la vida cotidiana.",
              )}</p>
            </div>
            <span className="about-content-link">{t("Read technology stories", "Leer historias de tecnología")} <span aria-hidden="true">↗</span></span>
          </Link>

          <Link className="about-content-card about-content-card-interests" href="/public">
            <div className="about-content-card-top"><Heart aria-hidden="true" /><span>{t("READER INTERESTS", "INTERESES DE LECTORES")}</span></div>
            <div className="about-content-card-body">
              <p className="about-content-index">03</p>
              <h3>{t("Readers' hobbies, turned into stories.", "Las aficiones de los lectores, convertidas en historias.")}</h3>
              <p>{t(
                "Travel journals, personal essays, anime, creative projects, and the hobbies that become stories worth sharing.",
                "Diarios de viaje, ensayos personales, anime, proyectos creativos y aficiones que se convierten en historias para compartir.",
              )}</p>
            </div>
            <span className="about-content-link">{t("Explore the collection", "Explorar la colección")} <span aria-hidden="true">↗</span></span>
          </Link>
        </div>
      </section>

      <section className="about-principles" aria-labelledby="about-principles-title">
        <div className="about-principles-heading">
          <p className="eyebrow">{t("OUR PROMISE", "NUESTRA PROMESA")}</p>
          <h2 id="about-principles-title">{t("The story remains yours.", "La historia sigue siendo tuya.")}</h2>
        </div>
        <div className="about-principle-list">
          <article><ShieldCheck aria-hidden="true" /><div><h3>{t("Private by default", "Privada por defecto")}</h3><p>{t("A draft becomes visible only through an explicit choice.", "Un borrador solo se hace visible mediante una decisión explícita.")}</p></div></article>
          <article><BookOpenText aria-hidden="true" /><div><h3>{t("Reviewed, not overwritten", "Revisada, no sobrescrita")}</h3><p>{t("Contributions wait for the creator instead of silently replacing their work.", "Las contribuciones esperan al creador en vez de sustituir silenciosamente su trabajo.")}</p></div></article>
          <article><SearchCheck aria-hidden="true" /><div><h3>{t("Grounded discovery", "Descubrimiento fundamentado")}</h3><p>{t("Search leads readers back to approved stories and the people behind them.", "La búsqueda devuelve al lector a historias aprobadas y a las personas que hay detrás.")}</p></div></article>
        </div>
      </section>

      <section className="about-journey" aria-labelledby="about-journey-title">
        <div className="about-journey-intro">
          <p className="eyebrow">{t("A STORY'S JOURNEY", "EL VIAJE DE UNA HISTORIA")}</p>
          <h2 id="about-journey-title">{t("From first spark to shared world.", "De la primera chispa al mundo compartido.")}</h2>
        </div>
        <ol>
          <li><span>01</span><div><h3>{t("Shape it privately", "Dale forma en privado")}</h3><p>{t("Write, arrange, and revise without performing for an audience.", "Escribe, organiza y revisa sin actuar para una audiencia.")}</p></div></li>
          <li><span>02</span><div><h3>{t("Invite precisely", "Invita con precisión")}</h3><p>{t("Choose who can read, who can suggest, and which story the invitation covers.", "Elige quién puede leer, quién puede proponer y a qué historia se aplica la invitación.")}</p></div></li>
          <li><span>03</span><div><h3>{t("Review with care", "Revisa con cuidado")}</h3><p>{t("Accept changes one decision at a time while the original remains intact.", "Acepta cambios decisión a decisión mientras el original permanece intacto.")}</p></div></li>
          <li><span>04</span><div><h3>{t("Publish intentionally", "Publica con intención")}</h3><p>{t("Open the finished work to the collection when it is ready to travel.", "Abre la obra terminada a la colección cuando esté lista para viajar.")}</p></div></li>
        </ol>
      </section>

      <section className="about-closing" aria-labelledby="about-closing-title">
        <p className="eyebrow">{t("YOUR NEXT CHAPTER", "TU PRÓXIMO CAPÍTULO")}</p>
        <h2 id="about-closing-title">{t("Leave a little of your world here.", "Deja aquí un poco de tu mundo.")}</h2>
        <p>{t("Begin in private, bring in the right people, and share only when the story feels like yours.", "Empieza en privado, invita a las personas adecuadas y comparte solo cuando la historia se sienta tuya.")}</p>
        <div className="about-closing-actions">
          <Button asChild><Link href="/workspace">{t("Open my atelier", "Abrir mi taller")}</Link></Button>
          <Link className="about-text-link" href="/public">{t("Browse public stories", "Explorar historias públicas")} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </article>
  );
}
