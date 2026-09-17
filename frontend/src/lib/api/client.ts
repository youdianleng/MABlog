import { localizedError } from "../errors";

/** Carry HTTP status alongside the server message so expired sessions can prompt sign-in. */
export class ApiError extends Error {
  /** Preserve the response status when constructing a user-visible request error. */
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Fetch same-origin API data with session cookies and explicit mutation intent. */
export async function api<T>(path: string, method = "GET", data?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: { "X-MAblog": "1", ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }) },
    body: data instanceof FormData ? data : data === undefined ? undefined : JSON.stringify(data),
  });
  const payload = await response.json();
  if (!response.ok)
    throw new ApiError(
      localizedError(typeof payload.detail === "string" ? payload.detail : "Please check your input / Revisa los datos"),
      response.status,
    );
  return payload;
}
