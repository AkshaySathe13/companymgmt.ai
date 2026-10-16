// Same-origin path: next.config.ts proxies /api/v1 to the API, so the session cookie is first-party.
const baseUrl = "/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  { timeoutMs = 10_000, ...options }: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      signal: options.signal
        ? AbortSignal.any([options.signal, AbortSignal.timeout(timeoutMs)])
        : AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    if (error instanceof DOMException && error.name === "TimeoutError")
      throw new ApiError("The request took too long. Please try again.", 0);
    throw new ApiError(
      "Cannot reach the API. Start the backend and try again.",
      0,
    );
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      body.error?.message ?? "The request failed. Please try again.",
      response.status,
      body.error?.code,
    );
  return body as T;
}

/** The API's own message for a failed request, or `fallback` for anything else (network, bugs). */
export function errorMessage(
  error: unknown,
  fallback = "That didn't work. Please try again.",
) {
  return error instanceof ApiError ? error.message : fallback;
}

/** True when a request was cancelled on purpose, so callers can ignore it. */
export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
