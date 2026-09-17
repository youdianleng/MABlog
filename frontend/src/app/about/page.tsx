import type { Metadata } from "next";
import { SiteInfoPage, type InfoSection } from "@/features/site-info/site-info-page";

export const metadata: Metadata = {
  title: "About",
  description: "Why MAblog exists and how it keeps creators in control of their stories.",
};

const SECTIONS: InfoSection[] = [
  {
    title: { en: "A place to make, not perform", es: "Un lugar para crear, no para actuar" },
    body: {
      en: "MAblog is an atelier for personal journals, imagined worlds, and stories that need room to become themselves before they meet an audience.",
      es: "MAblog es un taller para diarios personales, mundos imaginados e historias que necesitan espacio para crecer antes de encontrarse con una audiencia.",
    },
  },
  {
    title: { en: "Privacy begins with the author", es: "La privacidad empieza con el autor" },
    body: {
      en: "Every post starts private. Its creator decides when it can be shared, reviewed, or submitted for public discovery.",
      es: "Cada publicación empieza siendo privada. Su creador decide cuándo puede compartirse, revisarse o enviarse para su descubrimiento público.",
    },
  },
  {
    title: { en: "Made together", es: "Creado en compañía" },
    body: {
      en: "Invitations and review roles make collaboration explicit. People can contribute without turning ownership into an unclear group promise.",
      es: "Las invitaciones y los roles de revisión hacen explícita la colaboración. Se puede contribuir sin convertir la autoría en una promesa de grupo poco clara.",
    },
  },
  {
    title: { en: "Discovery with context", es: "Descubrimiento con contexto" },
    body: {
      en: "Public search is grounded in approved stories and preserves the path back to the author and source material.",
      es: "La búsqueda pública se fundamenta en historias aprobadas y conserva el camino de vuelta al autor y al material de origen.",
    },
  },
];

/** Present the product purpose and the principles that shape MAblog. */
export default function AboutPage() {
  return (
    <SiteInfoPage
      eyebrow={{ en: "Our story", es: "Nuestra historia" }}
      title={{ en: "Stories deserve a thoughtful home.", es: "Las historias merecen un hogar cuidado." }}
      intro={{
        en: "MAblog combines the freedom of a private notebook with the care of a small editorial room—and lets each creator decide where the boundary sits.",
        es: "MAblog combina la libertad de un cuaderno privado con el cuidado de una pequeña sala editorial y permite que cada creador decida dónde está el límite.",
      }}
      sections={SECTIONS}
    />
  );
}
