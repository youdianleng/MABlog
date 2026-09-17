import type { Metadata } from "next";
import { SiteInfoPage, type InfoSection } from "@/features/site-info/site-info-page";

export const metadata: Metadata = {
  title: "Help center",
  description: "A concise guide to writing, sharing, reviewing, and discovering stories on MAblog.",
};

const SECTIONS: InfoSection[] = [
  {
    title: { en: "Start a story", es: "Empieza una historia" },
    body: {
      en: "Sign in, choose Write, and shape the post in the freeform atelier. Drafts remain private until you deliberately change their access.",
      es: "Inicia sesión, elige Escribir y da forma a la publicación en el taller libre. Los borradores siguen siendo privados hasta que cambies su acceso de forma deliberada.",
    },
    items: [
      { en: "Arrange text and media on the canvas", es: "Organiza texto y contenido multimedia en el lienzo" },
      { en: "Save a draft before inviting anyone", es: "Guarda un borrador antes de invitar a nadie" },
    ],
  },
  {
    title: { en: "Share and collaborate", es: "Comparte y colabora" },
    body: {
      en: "Use the sharing view to invite a specific person and assign only the access they need. Reviewers can leave structured feedback without silently becoming co-owners.",
      es: "Usa la vista de compartir para invitar a una persona concreta y asignarle solo el acceso que necesita. Los revisores pueden dejar comentarios estructurados sin convertirse en copropietarios de forma implícita.",
    },
  },
  {
    title: { en: "Publish with intention", es: "Publica con intención" },
    body: {
      en: "Public posts enter the collection only through the publishing controls. Confirm the title, language, media rights, and intended audience first.",
      es: "Las publicaciones públicas entran en la colección solo mediante los controles de publicación. Confirma antes el título, el idioma, los derechos del contenido multimedia y la audiencia prevista.",
    },
  },
  {
    title: { en: "Find the right story", es: "Encuentra la historia adecuada" },
    body: {
      en: "Browse the collection for categories and authors, or use search for a direct question. Search results identify the supporting public stories.",
      es: "Explora la colección por categorías y autores o usa la búsqueda para una pregunta directa. Los resultados identifican las historias públicas que los respaldan.",
    },
  },
];

/** Present the core MAblog workflows as a compact bilingual help center. */
export default function HelpPage() {
  return (
    <SiteInfoPage
      eyebrow={{ en: "Help center", es: "Centro de ayuda" }}
      title={{ en: "From first line to shared story.", es: "De la primera línea a la historia compartida." }}
      intro={{
        en: "The essential paths through MAblog are collected here. Start private, invite with precision, and publish only when the work is ready.",
        es: "Aquí se reúnen los recorridos esenciales de MAblog. Empieza en privado, invita con precisión y publica solo cuando la obra esté lista.",
      }}
      sections={SECTIONS}
      note={{
        en: "This local release uses the development mail inbox for account messages. A production deployment should connect a monitored support channel and transactional email provider.",
        es: "Esta versión local usa el buzón de desarrollo para los mensajes de cuenta. Un despliegue en producción debe conectar un canal de soporte supervisado y un proveedor de correo transaccional.",
      }}
    />
  );
}
