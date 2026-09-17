import "server-only";
import { cookies } from "next/headers";

export type RequestLocale = "en" | "es";
const DEFAULT_BACKEND_URL = "http://localhost:8000";

/** Resolve the internal FastAPI origin used only by Next.js server components. */
function backendUrl(): string {
  return (process.env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");
}

/** Read the validated language cookie used for server-rendered localized content. */
export async function requestLocale(): Promise<RequestLocale> {
  const value = (await cookies()).get("mablog-language")?.value;
  return value === "es" ? "es" : "en";
}

/** Fetch FastAPI data on the server while forwarding the current login cookie. */
export async function serverApi<T>(path: string): Promise<T | null> {
  const cookieHeader = (await cookies()).toString();
  try {
    const response = await fetch(backendUrl() + "/api" + path, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // Client views retain their request path if FastAPI is still starting.
    return null;
  }
}
