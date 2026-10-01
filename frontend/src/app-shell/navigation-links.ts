import { BookOpen, Compass, Cpu, Feather, type LucideIcon } from "lucide-react";

/** One bilingual navigation destination shared by the header bar and the side menu. */
export type NavigationLink = {
  href: string;
  en: string;
  es: string;
  icon: LucideIcon;
};

/** Primary destinations, in header order. */
export const PRIMARY_LINKS: NavigationLink[] = [
  { href: "/", en: "Discover", es: "Descubrir", icon: Compass },
  { href: "/public", en: "The collection", es: "La colección", icon: BookOpen },
  { href: "/ai-models", en: "AI Models", es: "Modelos IA", icon: Cpu },
  { href: "/workspace", en: "My atelier", es: "Mi taller", icon: Feather },
];

/** Information pages that the footer also links; listed compactly at the end of the side menu. */
export const SECONDARY_LINKS: Pick<NavigationLink, "href" | "en" | "es">[] = [
  { href: "/about", en: "About", es: "Acerca de" },
  { href: "/help", en: "Help center", es: "Centro de ayuda" },
  { href: "/guidelines", en: "Community guidelines", es: "Normas de la comunidad" },
  { href: "/privacy", en: "Privacy", es: "Privacidad" },
  { href: "/terms", en: "Terms", es: "Términos" },
];

/** Whether a link represents the current route; the home link only matches exactly. */
export function isActiveLink(path: string, href: string): boolean {
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}
