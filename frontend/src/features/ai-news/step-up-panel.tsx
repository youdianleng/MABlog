"use client";
import { useEffect, useState } from "react";
import { KeyRound, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { fetchStepUp, requestStepUp, verifyStepUp } from "./ai-news-api";

/** Provide password-and-email-code authorization for high-impact newsroom actions. */
export function StepUpPanel() {
  const { t } = useLanguage();
  const [authorized, setAuthorized] = useState(false), [password, setPassword] = useState(""), [challenge, setChallenge] = useState(""), [code, setCode] = useState(""), [message, setMessage] = useState("");
  useEffect(/** Read the session-bound authorization state when the workspace opens. */ function loadStatus() { void fetchStepUp().then(/** Apply the redacted authorization response. */ function apply(value) { setAuthorized(value.authorized); }).catch(/** Keep protected controls gated when status cannot be read. */ function unavailable() { setAuthorized(false); }); }, []);
  /** Verify the administrator password and either authorize local development or request email proof. */
  async function begin() {
    try {
      const result = await requestStepUp(password);
      setPassword("");
      if (result.authorized) { setAuthorized(true); setMessage(t("Administrator access confirmed.", "Acceso de administrador confirmado.")); }
      else { setChallenge(result.challenge_id ?? ""); setMessage(t("Enter the code sent to your email.", "Introduce el código enviado a tu correo.")); }
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : t("Authorization failed.", "La autorización falló.")); }
  }
  /** Consume the emailed one-time code and unlock protected controls for ten minutes. */
  async function confirmCode() {
    try { await verifyStepUp(challenge, code); setAuthorized(true); setCode(""); setChallenge(""); setMessage(t("Administrator access confirmed.", "Acceso de administrador confirmado.")); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : t("Code verification failed.", "La verificación del código falló.")); }
  }
  return (
    <section className={`news-step-up ${authorized ? "authorized" : ""}`} aria-label={t("Protected actions", "Acciones protegidas")}>
      {authorized ? <><KeyRound aria-hidden="true" size={18} /><div><strong>{t("Protected actions unlocked", "Acciones protegidas desbloqueadas")}</strong><span>{t("This session can publish, unpublish, change sources, and manage providers.", "Esta sesión puede publicar, retirar, cambiar fuentes y gestionar proveedores.")}</span></div></> : <><LockKeyhole aria-hidden="true" size={18} /><div className="news-step-fields"><strong>{t("Unlock protected actions", "Desbloquear acciones protegidas")}</strong>{challenge ? <><label>{t("Email code", "Código del correo")}<Input value={code} inputMode="numeric" maxLength={6} onChange={/** Keep the one-time code numeric and bounded. */ function changeCode(event) { setCode(event.target.value.replace(/\D/g, "")); }} /></label><Button onClick={/** Verify the supplied one-time code. */ function verify() { void confirmCode(); }}>{t("Verify code", "Verificar código")}</Button></> : <><label>{t("Password", "Contraseña")}<Input type="password" autoComplete="current-password" value={password} onChange={/** Keep the administrator password local to this form. */ function changePassword(event) { setPassword(event.target.value); }} /></label><Button disabled={!password} onClick={/** Begin protected authorization with the current password. */ function authorize() { void begin(); }}>{t("Continue", "Continuar")}</Button></>}</div></>}
      {message ? <p className="news-inline-message" role="status">{message}</p> : null}
    </section>
  );
}
