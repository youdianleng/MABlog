"use client";
import { useEffect, useState } from "react";
import { Shield, ShieldMinus, ShieldPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccount } from "@/features/auth/account-context";
import { useLanguage } from "@/lib/i18n";
import { fetchAdministrators, setAdministratorRole } from "./ai-news-api";
import type { AdministratorAccount } from "./ai-news-types";

/** Manage explicit human administrator roles while the backend protects the final active curator. */
export function AdministratorManagement() {
  const { user } = useAccount();
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<AdministratorAccount[]>([]), [reason, setReason] = useState("Administrator role review"), [error, setError] = useState("");
  /** Reload the protected human-account role list. */
  async function reload() { try { setAccounts(await fetchAdministrators()); setError(""); } catch (reasonValue) { setError(reasonValue instanceof Error ? reasonValue.message : "Administrators unavailable"); } }
  useEffect(/** Load current database roles when the tab opens. */ function initialize() { void reload(); }, []);
  /** Promote or demote one human account through the audited protected endpoint. */
  async function change(account: AdministratorAccount) { try { await setAdministratorRole(account.id, !account.is_admin, reason); await reload(); } catch (reasonValue) { setError(reasonValue instanceof Error ? reasonValue.message : "Role update failed"); } }
  return <section className="news-panel news-administrators"><header><div><span className="eyebrow">{t("PROTECTED MANAGEMENT", "GESTIÓN PROTEGIDA")}</span><h2>{t("Administrators", "Administradores")}</h2></div><Shield aria-hidden="true" /></header><p>{t("Every administrator can curate MABlog_IA. The final active administrator cannot be removed.", "Todos los administradores pueden gestionar MABlog_IA. El último administrador activo no puede ser eliminado.")}</p><label>{t("Reason for the next role change", "Motivo del próximo cambio de rol")}<Input value={reason} maxLength={1000} onChange={/** Keep the next audit explanation in local form state. */ function update(event) { setReason(event.target.value); }} /></label>{error ? <div className="notice error">{error}</div> : null}<div className="news-admin-list">{accounts.map(/** Render one human account with its explicit database role. */ function renderAccount(account) { return <article key={account.id}><UserRound aria-hidden="true" /><div><strong>{account.display_name || account.username}{account.id === user?.id ? ` · ${t("You", "Tú")}` : ""}</strong><span>@{account.username} · {account.email}</span></div><span className={`news-validation ${account.is_admin ? "passed" : ""}`}>{account.is_admin ? t("Administrator", "Administrador") : t("Member", "Miembro")}</span><Button variant={account.is_admin ? "outline" : "default"} disabled={reason.trim().length < 3} onClick={/** Request the inverse administrator role for this human account. */ function updateRole() { void change(account); }}>{account.is_admin ? <ShieldMinus aria-hidden="true" /> : <ShieldPlus aria-hidden="true" />}{account.is_admin ? t("Remove role", "Retirar rol") : t("Make admin", "Hacer admin")}</Button></article>; })}</div></section>;
}
