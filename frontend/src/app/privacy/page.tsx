import type { Metadata } from "next";
import { SiteInfoPage, type InfoSection } from "@/features/site-info/site-info-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "A plain-language overview of data and privacy controls in the current MAblog release.",
};

const SECTIONS: InfoSection[] = [
  {
    title: { en: "What the service keeps", es: "Qué conserva el servicio" },
    body: {
      en: "MAblog stores account and session records, profile details, authored posts and media, access grants, review activity, and engagement needed to operate the product.",
      es: "MAblog almacena registros de cuenta y sesión, datos del perfil, publicaciones y contenido multimedia, permisos de acceso, actividad de revisión e interacciones necesarias para operar el producto.",
    },
  },
  {
    title: { en: "Visibility is explicit", es: "La visibilidad es explícita" },
    body: {
      en: "Posts begin private. Sharing and publishing are separate creator actions, and public discovery should include only content approved for public access.",
      es: "Las publicaciones empiezan siendo privadas. Compartir y publicar son acciones separadas del creador, y el descubrimiento público debe incluir solo contenido aprobado para acceso público.",
    },
  },
  {
    title: { en: "Search and AI", es: "Búsqueda e IA" },
    body: {
      en: "Grounded search uses eligible public material to answer questions and identify sources. The product should not use private drafts as public-search evidence.",
      es: "La búsqueda fundamentada usa material público apto para responder preguntas e identificar fuentes. El producto no debe usar borradores privados como evidencia para la búsqueda pública.",
    },
  },
  {
    title: { en: "Your controls", es: "Tus controles" },
    body: {
      en: "Use account, sharing, and publishing controls to manage profile details, collaborators, and story visibility. Restrict a post before resolving any access concern.",
      es: "Usa los controles de cuenta, uso compartido y publicación para gestionar datos del perfil, colaboradores y visibilidad de las historias. Restringe una publicación antes de resolver cualquier duda de acceso.",
    },
  },
];

/** Summarize implemented privacy behavior without presenting draft copy as legal advice. */
export default function PrivacyPage() {
  return (
    <SiteInfoPage
      eyebrow={{ en: "Privacy overview", es: "Resumen de privacidad" }}
      title={{ en: "Your drafts are not a public promise.", es: "Tus borradores no son una promesa pública." }}
      intro={{
        en: "MAblog is designed around deliberate access: private by default, specific when shared, and discoverable only after publication.",
        es: "MAblog está diseñado en torno a un acceso deliberado: privado por defecto, específico al compartir y visible solo después de publicar.",
      }}
      sections={SECTIONS}
      note={{
        en: "This page documents the current product behavior; it is not a deployment-ready privacy policy. Before a public launch, add the operating entity, lawful bases, retention periods, processors, regional rights, and a monitored privacy contact with legal review.",
        es: "Esta página documenta el comportamiento actual del producto; no es una política de privacidad lista para producción. Antes de un lanzamiento público, añade la entidad operadora, bases jurídicas, plazos de conservación, encargados, derechos regionales y un contacto de privacidad supervisado, con revisión legal.",
      }}
    />
  );
}
