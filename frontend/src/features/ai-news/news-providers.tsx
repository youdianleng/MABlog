"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Settings2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { clearNewsProviderKey, fetchNewsProviders, replaceNewsProviderKey, saveNewsModels } from "./ai-news-api";
import type { NewsProviderSettings } from "./ai-news-types";

type Provider = "openai" | "brave";
const PROVIDERS: Provider[] = ["openai", "brave"];

/** Provide administrator-only key rotation and AI-news model assignment without revealing secrets. */
export function NewsProviders() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<NewsProviderSettings | null>(null);
  const [keys, setKeys] = useState<Record<Provider, string>>({ openai: "", brave: "" });
  const [small, setSmall] = useState(""), [strong, setStrong] = useState("");
  const [busy, setBusy] = useState(""), [error, setError] = useState(""), [message, setMessage] = useState("");

  /** Refresh non-secret status and synchronize editable model values. */
  const reload = useCallback(async function reload() {
    try {
      const result = await fetchNewsProviders();
      setSettings(result);
      setSmall(result.models.small.value);
      setStrong(result.models.strong.value);
      setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("Provider settings are unavailable.", "La configuración de proveedores no está disponible.")); }
  }, [t]);
  useEffect(/** Fetch protected provider state when this section opens. */ function initialize() { void reload(); }, [reload]);

  /** Replace a single provider secret and immediately clear its local text field. */
  async function saveKey(provider: Provider) {
    const value = keys[provider].trim();
    if (value.length < 8) { setError(t("Enter a provider key of at least 8 characters.", "Introduce una clave de al menos 8 caracteres.")); return; }
    setBusy(provider); setError(""); setMessage("");
    try {
      const result = await replaceNewsProviderKey(provider, value);
      setSettings(result);
      setKeys(/** Clear only the secret that was successfully saved. */ function clear(previous) { return { ...previous, [provider]: "" }; });
      setMessage(t("Key saved. New newsroom runs will use it.", "Clave guardada. Las nuevas ejecuciones la usarán."));
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("Could not save the key.", "No se pudo guardar la clave.")); }
    finally { setBusy(""); }
  }

  /** Clear a saved override only after an explicit warning about environment fallback. */
  async function removeKey(provider: Provider) {
    if (!window.confirm(t("Remove this saved key? An environment key will be used if configured.", "¿Eliminar esta clave guardada? Se usará la clave del entorno si está configurada."))) return;
    setBusy(provider); setError(""); setMessage("");
    try {
      setSettings(await clearNewsProviderKey(provider));
      setMessage(t("Saved override removed.", "Se eliminó la clave guardada."));
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("Could not remove the key.", "No se pudo eliminar la clave.")); }
    finally { setBusy(""); }
  }

  /** Save both model roles, or pass nulls to restore deployment defaults. */
  async function updateModels(reset = false) {
    setBusy("models"); setError(""); setMessage("");
    try {
      const result = await saveNewsModels(reset ? null : small.trim(), reset ? null : strong.trim());
      setSettings(result); setSmall(result.models.small.value); setStrong(result.models.strong.value);
      setMessage(t("Model assignments saved for future runs.", "Modelos guardados para las próximas ejecuciones."));
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("Could not save the models.", "No se pudieron guardar los modelos.")); }
    finally { setBusy(""); }
  }

  return <section className="news-panel news-provider-panel"><header><div><span className="eyebrow">{t("NEWSROOM CONFIGURATION", "CONFIGURACIÓN DE LA SALA")}</span><h2>{t("Providers & models", "Proveedores y modelos")}</h2></div><ShieldCheck aria-hidden="true" /></header>
    <p className="news-provider-intro">{t("Manage credentials used only by AI news. Saved keys are encrypted and never displayed again. Changes require the protected administrator unlock above and take effect for new runs.", "Gestiona las credenciales usadas solo por noticias de IA. Las claves guardadas están cifradas y no vuelven a mostrarse. Los cambios requieren desbloquear el acceso protegido y se aplican a las nuevas ejecuciones.")}</p>
    {error ? <p className="notice error" role="alert">{error}</p> : null}{message ? <p className="notice" role="status">{message}</p> : null}
    {!settings ? !error ? <p role="status">{t("Loading provider settings…", "Cargando proveedores…")}</p> : <Button variant="outline" onClick={/** Retry the protected status request. */ function retry() { void reload(); }}>{t("Retry", "Reintentar")}</Button> : <>
      <div className="news-provider-grid">{PROVIDERS.map(/** Render one independent credential rotation control. */ function renderProvider(provider) {
        const state = settings.providers[provider];
        const name = provider === "openai" ? "OpenAI" : "Brave Search";
        return <article key={provider} className="news-provider-card"><div className="news-provider-heading"><KeyRound aria-hidden="true" size={20} /><div><h3>{name}</h3><span className={`news-validation ${state.configured ? "passed" : ""}`}>{state.source === "saved" ? t("Saved key", "Clave guardada") : state.source === "environment" ? t("Environment key", "Clave del entorno") : t("Not configured", "Sin configurar")}</span></div></div><p>{provider === "openai" ? t("Responses generation, verification, and moderation for the newsletter.", "Generación, verificación y moderación del boletín mediante Responses.") : t("Broad web discovery alongside the official source registry.", "Descubrimiento web junto al registro de fuentes oficiales.")}</p><form onSubmit={/** Save only this provider's replacement key. */ function submit(event) { event.preventDefault(); void saveKey(provider); }}><label htmlFor={`news-key-${provider}`}>{t("New API key", "Nueva clave API")}</label><Input id={`news-key-${provider}`} type="password" autoComplete="off" spellCheck={false} value={keys[provider]} onChange={/** Keep the unsaved secret in this component only. */ function change(event) { setKeys(/** Replace this provider's local entry. */ function update(previous) { return { ...previous, [provider]: event.target.value }; }); }} /><small>{t("Leave blank to keep the current key. Its value cannot be viewed here.", "Déjalo vacío para conservar la clave actual. Su valor no puede verse aquí.")}</small><div className="news-provider-actions"><Button type="submit" disabled={busy !== "" || keys[provider].trim().length < 8}>{busy === provider ? t("Saving…", "Guardando…") : t("Save new key", "Guardar clave")}</Button>{state.source === "saved" ? <Button type="button" variant="outline" disabled={busy !== ""} onClick={/** Ask before removing the database override. */ function clear() { void removeKey(provider); }}>{t("Remove saved key", "Eliminar clave guardada")}</Button> : null}</div></form></article>;
      })}</div>
      <div className="news-model-settings"><div className="news-provider-heading"><Settings2 aria-hidden="true" size={22} /><div><h3>{t("Newsletter models", "Modelos del boletín")}</h3><p>{t("Use OpenAI model IDs available to your account. This does not change the model-ranking page or other site AI features.", "Usa identificadores de modelos OpenAI disponibles en tu cuenta. Esto no cambia la clasificación de modelos ni otras funciones de IA del sitio.")}</p></div></div><form onSubmit={/** Save the two newsroom model roles together. */ function submit(event) { event.preventDefault(); void updateModels(); }}><div className="news-form-grid"><label htmlFor="news-small-model">{t("Fast model · discovery & classification", "Modelo rápido · descubrimiento y clasificación")}<Input id="news-small-model" value={small} maxLength={160} required onChange={/** Update the fast model field. */ function change(event) { setSmall(event.target.value); }} /><small>{settings.models.small.source === "saved" ? t("Saved override", "Valor guardado") : t("Environment default", "Valor del entorno")}</small></label><label htmlFor="news-strong-model">{t("Strong model · writing & verification", "Modelo potente · redacción y verificación")}<Input id="news-strong-model" value={strong} maxLength={160} required onChange={/** Update the strong model field. */ function change(event) { setStrong(event.target.value); }} /><small>{settings.models.strong.source === "saved" ? t("Saved override", "Valor guardado") : t("Environment default", "Valor del entorno")}</small></label></div><div className="news-provider-actions"><Button type="submit" disabled={busy !== "" || !small.trim() || !strong.trim()}>{busy === "models" ? t("Saving…", "Guardando…") : t("Save models", "Guardar modelos")}</Button><Button type="button" variant="outline" disabled={busy !== ""} onClick={/** Restore both model IDs to environment defaults. */ function reset() { void updateModels(true); }}>{t("Use environment defaults", "Usar valores del entorno")}</Button></div></form><p className="news-provider-note">{t("Changing models does not update cost estimates automatically. Review the configured token-price rates and run budgets before enabling a schedule.", "Cambiar modelos no actualiza automáticamente las estimaciones de costes. Revisa las tarifas de tokens y los presupuestos antes de activar la programación.")}</p></div>
    </>}
  </section>;
}
