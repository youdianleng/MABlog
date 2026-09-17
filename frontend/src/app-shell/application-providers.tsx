"use client";
import { useCallback, useState } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { api, ApiError, type Profile } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { AccountContext, type AccountAction } from "@/features/auth/account-context";
import { AccountForm } from "@/features/auth/account-form";
import { useInitializeAccount } from "@/features/auth/use-initialize-account";

interface ApplicationProvidersProps {
  children: React.ReactNode;
  initialUser: Profile | null;
}

/** Provide account state, shared action errors, and in-place weekly reauthentication. */
export function ApplicationProviders({ children, initialUser }: ApplicationProvidersProps) {
  const { t } = useLanguage();
  const [user, setUser] = useState<Profile | null>(initialUser);
  const [message, setMessage] = useState("");
  const [reauth, setReauth] = useState(false);

  /** Refresh private account state after authentication or profile changes. */
  const refresh = useCallback(async function refreshAccount() {
    const result = await api<{ user: Profile | null }>("/auth/me");
    setUser(result.user);
  }, []);

  /** Run an account action and surface expired weekly sessions without leaving the page. */
  async function run(action: AccountAction): Promise<void> {
    try {
      await action();
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Request failed", "La solicitud falló"));
      if (error instanceof ApiError && error.status === 401) setReauth(true);
    }
  }

  useInitializeAccount(refresh);

  return (
    <AccountContext.Provider value={{ user, run, refresh }}>
      {children}
      {message ? (
        <div className="notice error toast" role="alert">
          {message}
          <button className="ml-4" aria-label={t("Dismiss", "Cerrar")} onClick={/** Dismiss the current operation message. */ function dismissMessage() { setMessage(""); }}>×</button>
        </div>
      ) : null}
      <Dialog.Root open={reauth} onOpenChange={/** Keep overlay state synchronized with escape-key dismissal. */ function changeReauthentication(open) { setReauth(open); }}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "#29231cca", zIndex: 150 }} />
          <Dialog.Content style={{ position: "fixed", inset: 20, overflow: "auto", zIndex: 151 }}>
            <Dialog.Title className="sr-only">{t("Sign in again", "Vuelve a iniciar sesión")}</Dialog.Title>
            <Dialog.Description className="sr-only">{t("Sign in to continue saving. Your open draft stays here.", "Inicia sesión para seguir guardando. Tu borrador permanece abierto.")}</Dialog.Description>
            <button className="icon-button" aria-label={t("Close sign in", "Cerrar acceso")} onClick={/** Close reauthentication while preserving the mounted page. */ function closeReauthentication() { setReauth(false); }}><X size={16} /></button>
            <AccountForm onSuccess={/** Refresh the account and close the overlay after verification. */ async function finishAuthentication() { await refresh(); setReauth(false); setMessage(""); }} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </AccountContext.Provider>
  );
}
