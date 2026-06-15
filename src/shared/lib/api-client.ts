const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-fspark.kusl.io.vn";

type ApiRequestOptions = RequestInit & {
  accessToken?: string;
};

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  { accessToken, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiErrorPayload
    | null;

  if (!response.ok) {
    const errorPayload =
      payload && typeof payload === "object"
        ? (payload as ApiErrorPayload)
        : null;
    const message =
      errorPayload?.message
        ? errorPayload.message
        : errorPayload?.error
          ? errorPayload.error
          : "Unable to connect to the server. Please try again.";

    throw new ApiError(message, response.status);
  }

  return payload as T;
}
