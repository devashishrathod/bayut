type ApiOptions = {
  baseUrl?: string;
};

const defaultBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function readErrorPayload(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function messageFromPayload(payload: unknown): string {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && payload !== null) {
    const maybeMessage = (payload as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
    if (
      Array.isArray(maybeMessage) &&
      maybeMessage.every((m) => typeof m === "string")
    ) {
      return maybeMessage.join(", ");
    }
  }
  return "";
}

export function getApiBaseUrl(options?: ApiOptions) {
  return options?.baseUrl ?? defaultBaseUrl;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const payload = await readErrorPayload(res);
    const payloadMessage = messageFromPayload(payload);
    const message = payloadMessage || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, payload);
  }

  return (await res.json()) as T;
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  init?: RequestInit,
): Promise<TResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    method: "POST",
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await readErrorPayload(res);
    const payloadMessage = messageFromPayload(payload);
    const message = payloadMessage || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, payload);
  }

  return (await res.json()) as TResponse;
}

export async function apiGetSafe<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    return await apiGet<T>(path, init);
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("accessToken");
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("accessToken", token);
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("accessToken");
  window.dispatchEvent(new Event("auth-changed"));
}
