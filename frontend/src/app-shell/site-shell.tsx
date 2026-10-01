"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Newspaper, Plus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/features/posts";
import { useAccount } from "@/features/auth/account-context";
import { HeaderSearch } from "@/features/search";
import { SiteFooter } from "@/app-shell/site-footer";
import { isActiveLink, PRIMARY_LINKS } from "./navigation-links";
import { SideMenu } from "./side-menu";
import { useShellActions } from "./use-shell-actions";

/**
 * Render persistent navigation around route-native Next.js page content.
 *
 * Elements marked `header-bar-only` disappear below the header collapse breakpoint (narrow
 * windows or heavy browser zoom); the side menu then carries all navigation and account actions.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { t, locale, setLocale } = useLanguage();
  const { user } = useAccount();
  const { writePost, signOut } = useShellActions();
  const showFooterCallout =
    path !== "/about" &&
    path !== "/help" &&
    path !== "/ai-models" &&
    !path.startsWith("/compose/") &&
    !path.startsWith("/review/") &&
    !path.startsWith("/sharing/") &&
    !path.startsWith("/admin/");

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        {t("Skip to main content", "Saltar al contenido principal")}
      </a>
      <header className="site-header">
        <SideMenu />
        <Link href="/" className="brand">
          <span className="seal">M</span>MAblog<span className="brand-star">✦</span>
        </Link>
        <nav
          className="nav header-bar-only"
          aria-label={t("Primary navigation", "Navegación principal")}
        >
          {PRIMARY_LINKS.map(
            /** Render one primary destination with its current-page state. */ (link) => (
              <Link
                key={link.href}
                className={isActiveLink(path, link.href) ? "active" : undefined}
                href={link.href}
              >
                {t(link.en, link.es)}
              </Link>
            ),
          )}
        </nav>
        <div className="header-bar-only header-search-slot">
          <HeaderSearch />
        </div>
        <div className="account-nav header-bar-only">
          <select
            className="language"
            aria-label={t("Language", "Idioma")}
            value={locale}
            onChange={
              /** Persist the interface and server-rendering language. */ function selectLanguage(
                event,
              ) {
                setLocale(event.target.value as "en" | "es");
              }
            }
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          {user ? (
            <>
              {user.is_admin ? (
                <Link
                  className="admin-news-link"
                  href="/admin/ai-news"
                  title={t("Weekly AI newsroom", "Sala de noticias de IA")}
                >
                  <Newspaper aria-hidden="true" size={16} />
                  <span>{t("AI newsroom", "Sala IA")}</span>
                </Link>
              ) : null}
              <Link href="/profile" title={user.username}>
                <Avatar user={user} />
              </Link>
              <button title={t("Sign out", "Cerrar sesión")} onClick={signOut}>
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <Link href="/account">{t("Sign in", "Entrar")}</Link>
          )}
          <Button size="sm" onClick={writePost}>
            <Plus size={14} />
            {t("Write", "Escribir")}
          </Button>
        </div>
      </header>
      <main id="main-content" className="page">
        {children}
      </main>
      <SiteFooter showCallout={showFooterCallout} />
    </div>
  );
}
