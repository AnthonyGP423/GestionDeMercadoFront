export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export type HttpHeaders = Record<string, string>;

export interface HttpRequestConfig {
  params?: object;
  headers?: HttpHeaders;
  signal?: AbortSignal;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  headers: HttpHeaders;
}

export interface HttpErrorResponse<T = any> {
  data: T;
  status: number;
  headers: HttpHeaders;
  url: string;
}

export class HttpError<T = any> extends Error {
  response?: HttpErrorResponse<T>;
  status?: number;
  data?: T;
  userMessage: string;

  constructor(
    message: string,
    options: {
      response?: HttpErrorResponse<T>;
      userMessage: string;
      cause?: unknown;
    }
  ) {
    super(message);
    this.name = "HttpError";
    this.response = options.response;
    this.status = options.response?.status;
    this.data = options.response?.data;
    this.userMessage = options.userMessage;

    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

// Evita disparar varias veces el mismo flujo de sesión expirada.
let expiredHandled = false;
let lastToken: string | null = null;

const JSON_CONTENT_TYPE = "application/json";

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function resolveUrl(url: string) {
  if (isAbsoluteUrl(url)) return url;

  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

function buildHeaders(customHeaders?: HttpHeaders, body?: unknown) {
  const headers = new Headers(customHeaders);
  const token =
    localStorage.getItem("token_cliente") ||
    localStorage.getItem("token_intranet") ||
    localStorage.getItem("token");

  if (token && token !== lastToken) {
    lastToken = token;
    expiredHandled = false;
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json, text/plain, */*");
  }

  if (
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(body) &&
    typeof body !== "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", JSON_CONTENT_TYPE);
  }

  return headers;
}

function buildQueryString(params?: object) {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params as Record<string, unknown>).forEach(([key, rawValue]) => {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    values.forEach((item) => {
      if (item === null || item === undefined) return;
      searchParams.append(key, String(item));
    });
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function toPlainHeaders(headers: Headers): HttpHeaders {
  return Object.fromEntries(headers.entries());
}

function extractMessage(data: unknown) {
  let msg = "Ocurrió un error";

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    const candidate =
      record.message ||
      record.mensaje ||
      record.error ||
      record.detail ||
      record.title ||
      record.descripcion;

    if (typeof candidate === "string" && candidate.trim()) {
      msg = candidate;
    }
  }

  return msg;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const raw = await response.text();
  if (!raw) return undefined;

  const contentType = response.headers.get("content-type") || "";
  if (/(^|\/|\+)json($|;)/i.test(contentType)) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  return raw;
}

function normalizeBody(body?: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    typeof body === "string"
  ) {
    return body as BodyInit;
  }

  return JSON.stringify(body);
}

function handleExpiredSession(status: number) {
  if ((status !== 401 && status !== 403) || expiredHandled) return;

  expiredHandled = true;

  localStorage.removeItem("token_cliente");
  localStorage.removeItem("token_intranet");
  localStorage.removeItem("token");

  window.dispatchEvent(
    new CustomEvent("auth:session-expired", {
      detail: {
        message: "Tu sesión ha expirado. Vuelve a iniciar sesión.",
      },
    })
  );
}

async function request<T = any>(
  method: string,
  url: string,
  body?: unknown,
  config: HttpRequestConfig = {}
): Promise<HttpResponse<T>> {
  const requestUrl = `${resolveUrl(url)}${buildQueryString(config.params)}`;
  const headers = buildHeaders(config.headers, body);

  try {
    const response = await fetch(requestUrl, {
      method,
      headers,
      body: normalizeBody(body),
      signal: config.signal,
    });

    const data = (await parseResponseBody(response)) as T;
    const responsePayload: HttpResponse<T> = {
      data,
      status: response.status,
      headers: toPlainHeaders(response.headers),
    };

    if (!response.ok) {
      handleExpiredSession(response.status);

      const userMessage =
        response.status >= 500 && data === undefined
          ? "Ocurrió un error en el servidor."
          : extractMessage(data);

      throw new HttpError(userMessage, {
        userMessage,
        response: {
          data,
          status: response.status,
          headers: responsePayload.headers,
          url: requestUrl,
        },
      });
    }

    return responsePayload;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    const userMessage = "No se pudo conectar con el servidor. Revisa tu conexión.";
    throw new HttpError(userMessage, {
      userMessage,
      cause: error,
    });
  }
}

const http = {
  get<T = any>(url: string, config?: HttpRequestConfig) {
    return request<T>("GET", url, undefined, config);
  },

  delete<T = any>(url: string, config?: HttpRequestConfig) {
    return request<T>("DELETE", url, undefined, config);
  },

  post<T = any>(url: string, body?: unknown, config?: HttpRequestConfig) {
    return request<T>("POST", url, body, config);
  },

  put<T = any>(url: string, body?: unknown, config?: HttpRequestConfig) {
    return request<T>("PUT", url, body, config);
  },

  patch<T = any>(url: string, body?: unknown, config?: HttpRequestConfig) {
    return request<T>("PATCH", url, body, config);
  },
};

export default http;
