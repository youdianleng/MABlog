"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Newspaper, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/features/posts";
import { useAccount } from "@/features/auth/account-context";
import { HeaderSearch } from "@/features/search";
import { SiteFooter } from "@/app-shell/site-footer";

/** Render persistent navigation around route-native Next.js page content. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const { user, run, refresh } = useAccount();
  const showFooterCallout = path !== "/about" && path !== "/help" && !path.startsWith("/compose/") && !path.startsWith("/review/") && !path.startsWith("/sharing/") && !path.startsWith("/admin/");

  /** Create a personal post and navigate to its freeform composer. */
  async function createPost(): Promise<void> {
    const post = await api<{ id: string }>("/posts", "POST");
    router.push("/compose/" + post.id);
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">{t("Skip to main content", "Saltar al contenido principal")}</a>
      <header className="site-header">
        <Link href="/" className="brand"><span className="seal">M</span>MAblog<span className="brand-star">✦</span></Link>
        <nav className="nav" aria-label={t("Primary navigation", "Navegación principal")}>
          <Link className={path === "/" ? "active" : ""} href="/">{t("Discover", "Descubrir")}</Link>
          <Link className={path === "/public" ? "active" : ""} href="/public">{t("The collection", "La colección")}</Link>
          <Link className={path === "/workspace" ? "optional active" : "optional"} href="/workspace">{t("My atelier", "Mi taller")}</Link>
        </nav>
        <HeaderSearch />
        <div className="account-nav">
          <select className="language" aria-label={t("Language", "Idioma")} value={locale} onChange={/** Persist the interface and server-rendering language. */ function selectLanguage(event) { setLocale(event.target.value as "en" | "es"); }}>
            <option value="en">EN</option><option value="es">ES</option>
          </select>
          {user ? (
            <>
              {user.is_admin ? <Link className="admin-news-link" href="/admin/ai-news" title={t("Weekly AI newsroom", "Sala de noticias de IA")}><Newspaper aria-hidden="true" size={16} /><span>{t("AI newsroom", "Sala IA")}</span></Link> : null}
              <Link href="/profile" title={user.username}><Avatar user={user} /></Link>
              <button title={t("Sign out", "Cerrar sesión")} onClick={/** Revoke the session through shared action handling. */ function logout() { void run(/** End the session and refresh account state. */ async function endSession() { await api("/auth/logout", "POST"); await refresh(); router.push("/"); }); }}><LogOut size={15} /></button>
            </>
          ) : <Link href="/account">{t("Sign in", "Entrar")}</Link>}
          <Button size="sm" onClick={/** Create an authenticated post through shared error handling. */ function newPost() { void run(createPost); }}><Plus size={14} />{t("Write", "Escribir")}</Button>
        </div>
      </header>
      <main id="main-content" className="page">{children}</main>
      <SiteFooter showCallout={showFooterCallout} />
    </div>
  );
}
