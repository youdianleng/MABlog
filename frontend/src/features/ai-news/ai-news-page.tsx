"use client";
import { Bell, BookOpenCheck, DatabaseZap, Newspaper, UsersRound } from "lucide-react";
import { Loading } from "@/components/feedback/loading";
import { useAccount } from "@/features/auth/account-context";
import { useLanguage } from "@/lib/i18n";
import { useNewsWorkspace } from "./ai-news-store";
import { useNewsStatus } from "./use-news-status";
import { StepUpPanel } from "./step-up-panel";
import { NewsOverview } from "./news-overview";
import { NewsRunPanel } from "./news-run-panel";
import { NewsSources } from "./news-sources";
import { NewsEditions } from "./news-editions";
import { NewsAlerts } from "./news-alerts";
import { AdministratorManagement } from "./administrator-management";
import type { NewsTab } from "./ai-news-types";

const TABS: Array<{ id: NewsTab; icon: typeof Newspaper; en: string; es: string }> = [
  { id: "overview", icon: Newspaper, en: "Overview", es: "Resumen" },
  { id: "sources", icon: DatabaseZap, en: "Sources", es: "Fuentes" },
  { id: "editions", icon: BookOpenCheck, en: "Editions", es: "Ediciones" },
  { id: "alerts", icon: Bell, en: "Alerts", es: "Alertas" },
  { id: "administrators", icon: UsersRound, en: "Administrators", es: "Administradores" },
];

/** Compose the protected weekly AI-news operations workspace. */
export function AiNewsPage() {
  const { user } = useAccount();
  const { t } = useLanguage();
  const tab = useNewsWorkspace(/** Subscribe to the active newsroom tab only. */ function select(state) { return state.tab; });
  const setTab = useNewsWorkspace(/** Select the tab-changing action. */ function select(state) { return state.setTab; });
  const { data, error, reload } = useNewsStatus();
  if (!user?.is_admin) return <div className="form-panel"><h1>{t("Administrator access required", "Se requiere acceso de administrador")}</h1><p>{t("This workspace manages the system-owned MABlog_IA publisher.", "Este espacio gestiona el publicador del sistema MABlog_IA.")}</p></div>;
  return <div className="ai-news-workspace"><header className="news-hero"><div><span className="eyebrow">{t("AUTOMATED EDITORIAL OPERATIONS", "OPERACIONES EDITORIALES AUTOMATIZADAS")}</span><h1>{t("Weekly AI newsroom", "Sala de noticias de IA semanal")}</h1><p>{t("Official model releases become one evidence-checked bilingual roundup. Publication remains gated at every stage.", "Los lanzamientos oficiales de modelos se convierten en un resumen bilingüe verificado con evidencias. La publicación permanece protegida en cada etapa.")}</p></div><div className="news-identity"><span className="seal">IA</span><div><strong>MABlog_IA</strong><small>{t("System-owned publisher", "Publicador propiedad del sistema")}</small></div></div></header><StepUpPanel /><nav className="news-tabs" aria-label={t("AI newsroom sections", "Secciones de la sala de IA")}>{TABS.map(/** Render one stable newsroom section control. */ function renderTab(item) { const Icon = item.icon; return <button key={item.id} aria-current={tab === item.id ? "page" : undefined} onClick={/** Show the selected newsroom section. */ function selectTab() { setTab(item.id); }}><Icon aria-hidden="true" />{t(item.en, item.es)}{item.id === "alerts" && data?.unread_alerts ? <span>{data.unread_alerts}</span> : null}</button>; })}</nav>{tab === "overview" ? data ? <NewsOverview status={data} onChanged={reload} /> : <Loading error={error} /> : null}{tab === "sources" ? <NewsSources /> : null}{tab === "editions" ? <NewsEditions /> : null}{tab === "alerts" ? <NewsAlerts /> : null}{tab === "administrators" ? <AdministratorManagement /> : null}<NewsRunPanel onChanged={reload} /></div>;
}
