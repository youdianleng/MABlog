import { localizedError } from "../errors";

// Shown when a response has no usable JSON detail (proxy HTML error page, empty body, or network error).
const GENERIC_ERROR = "Please check your input / Revisa los datos";
const UNAVAILABLE_ERROR = "The service is temporarily unavailable. Please try again.";

/** Carry HTTP status alongside the server message so expired sessions can prompt sign-in. */
export class ApiError extends Error {
  /** Preserve the response status when constructing a user-visible request error. */
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/**
 * Parse a response body as JSON when possible.
 *
 * Returns `undefined` for empty bodies (for example 204 responses) and for non-JSON bodies such as
 * an HTML error page from the Next.js proxy when the backend is down.
 */
async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Build the user-visible error for a failed response from its JSON `detail`, if any. */
function responseError(response: Response, payload: unknown): ApiError {
  const detail =
    payload && typeof payload === "object" && "detail" in payload ? payload.detail : undefined;
  const fallback = response.status >= 500 ? UNAVAILABLE_ERROR : GENERIC_ERROR;
  return new ApiError(
    localizedError(typeof detail === "string" ? detail : fallback),
    response.status,
  );
}

/**
 * Read a same-origin API resource as text (for example a Markdown document).
 *
 * @throws ApiError with the server's `detail` and status for non-2xx responses, or status 0 when
 * the server could not be reached.
 */
export async function apiText(path: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: "same-origin",
      cache: "no-store",
      headers: { "X-MAblog": "1" },
    });
  } catch {
    throw new ApiError(localizedError(UNAVAILABLE_ERROR), 0);
  }
  if (!response.ok) throw responseError(response, await readJson(response));
  return response.text();
}

/**
 * Fetch same-origin API data with session cookies and explicit mutation intent.
 *
 * @throws ApiError with the server's `detail` message and HTTP status for non-2xx responses, or
 * with status 0 when the request could not reach the server.
 */
export async function api<T>(path: string, method = "GET", data?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "X-MAblog": "1",
        ...(data instanceof FormData ? {} : { "Content-Type": "application/json" }),
      },
      body: data instanceof FormData ? data : data === undefined ? undefined : JSON.stringify(data),
    });
  } catch {
    throw new ApiError(localizedError(UNAVAILABLE_ERROR), 0);
  }
  const payload = await readJson(response);
  if (!response.ok) throw responseError(response, payload);
  return payload as T;
}
