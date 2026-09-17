import type { Metadata } from "next";
import { SiteInfoPage, type InfoSection } from "@/features/site-info/site-info-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "A product-level overview of authorship, access, and acceptable use in MAblog.",
};

const SECTIONS: InfoSection[] = [
  {
    title: { en: "You remain the author", es: "Tú sigues siendo el autor" },
    body: {
      en: "Creating or uploading work does not transfer authorship to MAblog. You are responsible for having the rights needed to store, share, and publish it.",
      es: "Crear o subir una obra no transfiere su autoría a MAblog. Eres responsable de contar con los derechos necesarios para almacenarla, compartirla y publicarla.",
    },
  },
  {
    title: { en: "Permissions have scope", es: "Los permisos tienen alcance" },
    body: {
      en: "Collaboration grants are limited to the assigned role and post. A recipient must not reuse or redistribute private material beyond that scope.",
      es: "Los permisos de colaboración se limitan al rol y a la publicación asignados. Un destinatario no debe reutilizar ni redistribuir material privado fuera de ese alcance.",
    },
  },
  {
    title: { en: "Use the service lawfully", es: "Usa el servicio de forma lícita" },
    body: {
      en: "Do not misuse accounts, evade access controls, disrupt the service, upload malicious material, or publish content you are not entitled to share.",
      es: "No hagas un uso indebido de cuentas, eludas controles de acceso, interrumpas el servicio, subas material malicioso ni publiques contenido que no tengas derecho a compartir.",
    },
  },
  {
    title: { en: "Automated material needs context", es: "El material automatizado necesita contexto" },
    body: {
      en: "AI-assisted discovery and automated newsroom content can be incomplete or mistaken. Source links and editorial review remain important before relying on or republishing results.",
      es: "El descubrimiento asistido por IA y el contenido automatizado de la sala de noticias pueden ser incompletos o erróneos. Los enlaces a fuentes y la revisión editorial siguen siendo importantes antes de confiar en los resultados o volver a publicarlos.",
    },
  },
];

/** Summarize product expectations while clearly separating them from final legal terms. */
export default function TermsPage() {
  return (
    <SiteInfoPage
      eyebrow={{ en: "Terms overview", es: "Resumen de términos" }}
      title={{ en: "Clear roles make better collaborations.", es: "Los roles claros crean mejores colaboraciones." }}
      intro={{
        en: "MAblog's product rules center on authorship, scoped permissions, responsible publishing, and honest use of automated tools.",
        es: "Las reglas de producto de MAblog se centran en la autoría, los permisos limitados, la publicación responsable y el uso honesto de herramientas automatizadas.",
      }}
      sections={SECTIONS}
      note={{
        en: "This is a product overview for the local release, not final legal terms. A public deployment needs operator identity, jurisdiction, account eligibility, moderation and termination processes, warranties, liability, and dispute terms reviewed by qualified counsel.",
        es: "Este es un resumen de producto para la versión local, no unos términos legales definitivos. Un despliegue público necesita identidad del operador, jurisdicción, requisitos de cuenta, procesos de moderación y cierre, garantías, responsabilidad y resolución de conflictos revisados por asesoría jurídica cualificada.",
      }}
    />
  );
}
