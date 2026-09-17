import type { Metadata } from "next";
import { SiteInfoPage, type InfoSection } from "@/features/site-info/site-info-page";

export const metadata: Metadata = {
  title: "Community guidelines",
  description: "The standards that help MAblog remain a thoughtful and creator-led writing community.",
};

const SECTIONS: InfoSection[] = [
  {
    title: { en: "Respect authorship", es: "Respeta la autoría" },
    body: {
      en: "Share only work you created or have permission to use. Credit collaborators and sources clearly, and never present another person's work as your own.",
      es: "Comparte solo obras que hayas creado o que tengas permiso para usar. Acredita con claridad a colaboradores y fuentes, y nunca presentes la obra de otra persona como propia.",
    },
  },
  {
    title: { en: "Honor access boundaries", es: "Respeta los límites de acceso" },
    body: {
      en: "An invitation is permission for a defined role, not permission to redistribute private drafts, screenshots, or personal information.",
      es: "Una invitación es un permiso para un rol definido, no un permiso para redistribuir borradores privados, capturas o información personal.",
    },
  },
  {
    title: { en: "Publish responsibly", es: "Publica con responsabilidad" },
    body: {
      en: "Do not publish harassment, targeted abuse, unlawful material, deceptive impersonation, or content that exposes someone else's sensitive information.",
      es: "No publiques acoso, abuso dirigido, material ilícito, suplantación engañosa ni contenido que exponga información sensible de otra persona.",
    },
  },
  {
    title: { en: "Correct with care", es: "Corrige con cuidado" },
    body: {
      en: "When a material error is found, revise it transparently. If a shared or public post creates harm, restrict its access while the issue is reviewed.",
      es: "Cuando se detecte un error importante, corrígelo con transparencia. Si una publicación compartida o pública causa daño, restringe su acceso mientras se revisa el problema.",
    },
  },
];

/** Explain the minimum standards for safe and respectful participation. */
export default function GuidelinesPage() {
  return (
    <SiteInfoPage
      eyebrow={{ en: "Community guidelines", es: "Normas de la comunidad" }}
      title={{ en: "Make room for brave work—and for one another.", es: "Haz sitio para obras valientes y para los demás." }}
      intro={{
        en: "Creative freedom grows when authorship, privacy, and the people behind the work are treated with care. These standards apply across drafts, invitations, reviews, and public posts.",
        es: "La libertad creativa crece cuando la autoría, la privacidad y las personas detrás de la obra se tratan con cuidado. Estas normas se aplican a borradores, invitaciones, revisiones y publicaciones públicas.",
      }}
      sections={SECTIONS}
    />
  );
}
