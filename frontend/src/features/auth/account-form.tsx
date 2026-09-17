"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Handle registration, sign-in, recovery, verification, and resend in one localized form. */
export function AccountForm({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState("login"),
    [login, setLogin] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [code, setCode] = useState(""),
    [newPassword, setNewPassword] = useState(""),
    [challenge, setChallenge] = useState(""),
    [recovery, setRecovery] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false);
  /** Request a fresh code using the original credentials; the server enforces resend cooldown. */
  async function requestCode() {
    return mode === "recover" || recovery
      ? api<{ challenge_id: string }>("/auth/recover", "POST", { email })
      : api<{ challenge_id: string; ok?: boolean }>("/auth/login", "POST", {
          login: login || email,
          password,
        });
  }
  /** Submit the current account step and keep credentials only in component memory. */
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let result: { challenge_id?: string; ok?: boolean };
      if (mode === "register")
        result = await api("/auth/register", "POST", {
          email,
          username: login,
          password,
        });
      else if (mode === "verify")
        result = await api("/auth/verify", "POST", {
          challenge_id: challenge,
          code,
          ...(recovery ? { new_password: newPassword } : {}),
        });
      else result = await requestCode();
      if (result.challenge_id) {
        setChallenge(result.challenge_id);
        setRecovery(mode === "recover" || recovery);
        setMode("verify");
      } else {
        setSuccess(true);
        setPassword("");
        setNewPassword("");
        await onSuccess();
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  /** Resend without losing the verification screen or the new recovery password. */
  async function resend() {
    setBusy(true);
    try {
      const result = await requestCode();
      if (result.challenge_id) {
        setChallenge(result.challenge_id);
        setError("");
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <div className="form-panel stack">
        <h1>{t("Welcome to your atelier", "Bienvenido a tu taller")}</h1>
        <Link href="/workspace">
          <Button>{t("Open my workspace", "Abrir mi taller")}</Button>
        </Link>
      </div>
    );
  return (
    <form className="form-panel stack" onSubmit={submit}>
      <div className="eyebrow">MAblog · {t("YOUR ATELIER", "TU TALLER")}</div>
      <h1>
        {mode === "register"
          ? t("Begin your story", "Empieza tu historia")
          : mode === "verify"
            ? t("Check your inbox", "Revisa tu correo")
            : mode === "recover"
              ? t("Find your way back", "Recupera el acceso")
              : t("Welcome back", "Bienvenido de nuevo")}
      </h1>
      {mode === "verify" ? (
        <>
          <p>
            {t(
              "Enter the six-digit code from your email.",
              "Introduce el código de seis dígitos del correo.",
            )}
          </p>
          <label>
            {t("Verification code", "Código de verificación")}
            <Input
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              value={code}
              onChange={
                /** Keep the typed verification code in component memory. */ function changeCode(
                  event,
                ) {
                  setCode(event.target.value);
                }
              }
              required
            />
          </label>
          {recovery && (
            <label>
              {t("New password", "Nueva contraseña")}
              <Input
                type="password"
                minLength={10}
                value={newPassword}
                onChange={
                  /** Capture the replacement password for account recovery. */ function changeNewPassword(
                    event,
                  ) {
                    setNewPassword(event.target.value);
                  }
                }
                required
              />
            </label>
          )}
          <button type="button" onClick={resend} disabled={busy}>
            {t(
              "Resend code (after 60 seconds)",
              "Reenviar código (tras 60 segundos)",
            )}
          </button>
        </>
      ) : (
        <>
          {mode !== "recover" && (
            <label>
              {mode === "register"
                ? t("Username", "Nombre de usuario")
                : t("Email or username", "Correo o usuario")}
              <Input
                autoComplete="username"
                value={login}
                onChange={
                  /** Capture the email or username used for sign-in. */ function changeLogin(
                    event,
                  ) {
                    setLogin(event.target.value);
                  }
                }
                required
              />
            </label>
          )}
          {(mode === "register" || mode === "recover") && (
            <label>
              {t("Email", "Correo electrónico")}
              <Input
                type="email"
                value={email}
                onChange={
                  /** Capture the registration or recovery email address. */ function changeEmail(
                    event,
                  ) {
                    setEmail(event.target.value);
                  }
                }
                required
              />
            </label>
          )}
          {mode !== "recover" && (
            <label>
              {t(
                "Password (at least 10 characters)",
                "Contraseña (mínimo 10 caracteres)",
              )}
              <Input
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                minLength={10}
                value={password}
                onChange={
                  /** Keep password input in component memory only. */ function changePassword(
                    event,
                  ) {
                    setPassword(event.target.value);
                  }
                }
                required
              />
            </label>
          )}
        </>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      <Button disabled={busy} type="submit">
        {busy
          ? t("Please wait…", "Espera…")
          : mode === "verify"
            ? t("Verify email", "Verificar correo")
            : mode === "register"
              ? t("Create account", "Crear cuenta")
              : mode === "recover"
                ? t("Send recovery code", "Enviar código")
                : t("Sign in", "Entrar")}
      </Button>
      <div
        className="toolbar"
        style={{ justifyContent: "space-between", fontSize: 12 }}
      >
        <button
          type="button"
          onClick={
            /** Switch between sign-in and registration and reset recovery state. */ function switchMode() {
              setMode(mode === "register" ? "login" : "register");
              setRecovery(false);
              setError("");
            }
          }
        >
          {mode === "register"
            ? t("Already have an account?", "¿Ya tienes una cuenta?")
            : t("Create an account", "Crear una cuenta")}
        </button>
        <button
          type="button"
          onClick={
            /** Open the email recovery step. */ function recover() {
              setMode("recover");
              setRecovery(true);
            }
          }
        >
          {t("Forgot password?", "¿Olvidaste la contraseña?")}
        </button>
      </div>
    </form>
  );
}


