"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { LogIn, LogOut, Menu, Newspaper, Plus, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/features/posts";
import { useAccount } from "@/features/auth/account-context";
import { HeaderSearch } from "@/features/search";
import { isActiveLink, PRIMARY_LINKS, SECONDARY_LINKS } from "./navigation-links";
import { useShellActions } from "./use-shell-actions";

/**
 * Left-side navigation drawer opened from the header's Menu button.
 *
 * The button is available at every width. Below the header collapse breakpoint (see
 * `styles/side-menu.css`) — which is what a narrow window or heavy browser zoom produces — the
 * header bar hides its own links, search, and account controls, leaving this menu as the only
 * navigation. Radix Dialog supplies focus trapping, Escape to close, scroll locking, and focus
 * return to the Menu button.
 */
export function SideMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { t, locale, setLocale } = useLanguage();
  const { user } = useAccount();
  const { writePost, signOut } = useShellActions();

  /** Close the drawer; used after any navigation or account action inside it. */
  function close(): void {
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="side-menu-trigger" type="button">
          <Menu aria-hidden="true" />
          <span>{t("Menu", "Menú")}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="side-menu-overlay" />
        <Dialog.Content className="side-menu" aria-describedby={undefined}>
          <div className="side-menu-header">
            <Dialog.Title className="side-menu-title">
              <span className="seal" aria-hidden="true">
                M
              </span>
              MAblog
            </Dialog.Title>
            <Dialog.Close className="side-menu-close" aria-label={t("Close menu", "Cerrar menú")}>
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>

          <HeaderSearch onSubmitted={close} />

          <nav className="side-menu-section" aria-label={t("Site menu", "Menú del sitio")}>
            {PRIMARY_LINKS.map(
              /** Render one primary destination with its icon and current-page state. */ (
                link,
              ) => {
                const Icon = link.icon;
                const active = isActiveLink(path, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={active ? "active" : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={close}
                  >
                    <Icon aria-hidden="true" />
                    {t(link.en, link.es)}
                  </Link>
                );
              },
            )}
            {user?.is_admin ? (
              <Link
                href="/admin/ai-news"
                className={isActiveLink(path, "/admin/ai-news") ? "active" : undefined}
                onClick={close}
              >
                <Newspaper aria-hidden="true" />
                {t("AI newsroom", "Sala IA")}
              </Link>
            ) : null}
          </nav>

          <div className="side-menu-section side-menu-account">
            <Button
              className="side-menu-write"
              onClick={
                /** Close the drawer, then create a post through shared error handling. */ function newPost() {
                  close();
                  writePost();
                }
              }
            >
              <Plus aria-hidden="true" />
              {t("Write a story", "Escribir una historia")}
            </Button>
            {user ? (
              <>
                <Link href="/profile" className="side-menu-profile" onClick={close}>
                  <Avatar user={user} />
                  <span>
                    <strong>{user.display_name || user.username}</strong>
                    <small>@{user.username}</small>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={
                    /** Close the drawer and end the session. */ function logout() {
                      close();
                      signOut();
                    }
                  }
                >
                  <LogOut aria-hidden="true" />
                  {t("Sign out", "Cerrar sesión")}
                </button>
              </>
            ) : (
              <Link href="/account" onClick={close}>
                <LogIn aria-hidden="true" />
                {t("Sign in", "Entrar")}
              </Link>
            )}
          </div>

          <div className="side-menu-language" role="group" aria-label={t("Language", "Idioma")}>
            {(["en", "es"] as const).map(
              /** Render one language choice as a pressed/unpressed toggle. */ (value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={locale === value}
                  onClick={
                    /** Switch the interface and server-rendering language. */ function choose() {
                      setLocale(value);
                    }
                  }
                >
                  {value === "en" ? "English" : "Español"}
                </button>
              ),
            )}
          </div>

          <nav
            className="side-menu-section side-menu-secondary"
            aria-label={t("Information", "Información")}
          >
            {SECONDARY_LINKS.map(
              /** Render one information page link. */ (link) => (
                <Link key={link.href} href={link.href} onClick={close}>
                  {t(link.en, link.es)}
                </Link>
              ),
            )}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
