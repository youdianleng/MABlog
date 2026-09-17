"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type Locale = "en" | "es";
type Translation = (english: string, spanish: string) => string;
const LANGUAGE_COOKIE_SECONDS = 60 * 60 * 24 * 365;
const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (value: Locale) => void;
  t: Translation;
}>({ locale: "en", setLocale: defaultSetLocale, t: defaultTranslation });

/** Supply an English fallback before the provider mounts. */
function defaultTranslation(english: string): string {
  return english;
}

/** Keep the default context safe outside a provider during initial rendering. */
function defaultSetLocale(): void {
  /* The application provider supplies the active setter. */
}

/** Persist locale state for client interactions and future server renders. */
export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(
    /** Reconcile a legacy browser preference with the newer server-readable cookie. */
    function restoreLocale() {
      const stored = localStorage.getItem("mablog-language");
      if ((stored === "en" || stored === "es") && stored !== initialLocale) {
        setLocale(stored);
        document.documentElement.lang = stored;
        document.cookie =
          "mablog-language=" +
          stored +
          "; Path=/; Max-Age=" +
          LANGUAGE_COOKIE_SECONDS +
          "; SameSite=Lax";
        router.refresh();
      }
    },
    [initialLocale, router],
  );

  /** Persist a deliberate locale change and refresh server-rendered route data. */
  function changeLocale(value: Locale): void {
    setLocale(value);
    localStorage.setItem("mablog-language", value);
    document.documentElement.lang = value;
    document.cookie =
      "mablog-language=" +
      value +
      "; Path=/; Max-Age=" +
      LANGUAGE_COOKIE_SECONDS +
      "; SameSite=Lax";
    router.refresh();
  }

  /** Select the matching interface phrase without translating authored content. */
  function t(english: string, spanish: string): string {
    return locale === "es" ? spanish : english;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** Access the shared locale and bilingual interface string selector. */
export function useLanguage() {
  return useContext(LocaleContext);
}
