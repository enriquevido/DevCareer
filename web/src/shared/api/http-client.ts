const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(
  /\/+$/,
  "",
);

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  const body = serializeBody(options.body, headers);

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers,
    body,
  });

  const payload = await readResponse(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(payload, response.status),
      payload,
    );
  }

  return payload as T;
}

export function getApiUrl(path: string): string {
  return buildApiUrl(path);
}

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

function serializeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    typeof body === "string"
  ) {
    return body;
  }

  headers.set("Content-Type", "application/json");

  return JSON.stringify(body);
}

async function readResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (text.length === 0) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return JSON.parse(text) as unknown;
  }

  return text;
}

function getErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "string" && payload.trim().length > 0) {
    return payload;
  }

  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = payload.message;

    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message)) {
      const messages = message.filter(
        (item): item is string => typeof item === "string",
      );

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  return `The API request failed with status ${status}.`;
}
