import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "./client";

/** Replace global fetch with one canned response or failure for a single test. */
function mockFetch(result: Response | Error) {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      /** Resolve or reject exactly as the test configured. */ async () => {
        if (result instanceof Error) throw result;
        return result;
      },
    ),
  );
}

/** Transport behavior of the shared same-origin API client. */
describe("api client", () => {
  // Restore the real fetch after each stubbed case.
  afterEach(() => vi.unstubAllGlobals());

  // Successful JSON bodies are returned as-is.
  it("returns parsed JSON", async () => {
    mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(api("/health")).resolves.toEqual({ ok: true });
  });

  // Empty 204 responses no longer throw a JSON parse error.
  it("returns undefined for an empty body", async () => {
    mockFetch(new Response(null, { status: 204 }));
    await expect(api("/thing", "DELETE")).resolves.toBeUndefined();
  });

  // Server detail messages and status codes are preserved for callers.
  it("raises ApiError with the server detail", async () => {
    mockFetch(
      new Response(JSON.stringify({ detail: "Invalid login or password" }), { status: 401 }),
    );
    await expect(api("/auth/login", "POST", {})).rejects.toMatchObject({
      message: "Invalid login or password",
      status: 401,
    });
  });

  // A proxy HTML error page becomes a readable unavailable message instead of a parse error.
  it("handles non-JSON error pages", async () => {
    mockFetch(new Response("<html>Bad Gateway</html>", { status: 502 }));
    const error = await api("/posts").catch(
      /** Capture the rejection for inspection. */ (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
    expect((error as ApiError).message).toMatch(/temporarily unavailable/);
  });

  // Network failures surface as status 0.
  it("reports network failures with status 0", async () => {
    mockFetch(new TypeError("Failed to fetch"));
    await expect(api("/posts")).rejects.toMatchObject({ status: 0 });
  });
});
