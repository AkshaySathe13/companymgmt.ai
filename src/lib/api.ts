const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
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
        ? AbortSignal.any([options.signal, AbortSignal.timeout(10000)])
        : AbortSignal.timeout(10000),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError(
      "Cannot reach the API. Start the backend and try again.",
      0,
    );
  }
  const body = await response.json();
  if (!response.ok)
    throw new ApiError(
      body.error?.message ?? "The request failed. Please try again.",
      response.status,
    );
  return body as T;
}
