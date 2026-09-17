import type { Metadata } from "next";
import { serverApi, requestLocale } from "@/lib/server-api";
import type { Profile } from "@/lib/api";
import { LanguageProvider } from "@/lib/i18n";
import { ApplicationProviders } from "@/app-shell/application-providers";
import { SiteShell } from "@/app-shell/site-shell";
import "./globals.css";

const DEFAULT_SITE_URL = "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL),
  title: { default: "MAblog · Stories beyond the ordinary", template: "%s · MAblog" },
  description: "An atelier for stories, worlds, and the people who imagine them.",
};

/** Provide locale, account state, and the persistent site frame for every route. */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await requestLocale();
  const account = await serverApi<{ user: Profile | null }>("/auth/me");
  return (
    <html lang={locale}>
      <body>
        <LanguageProvider initialLocale={locale}>
          <ApplicationProviders initialUser={account?.user ?? null}>
            <SiteShell>{children}</SiteShell>
          </ApplicationProviders>
        </LanguageProvider>
      </body>
    </html>
  );
}
