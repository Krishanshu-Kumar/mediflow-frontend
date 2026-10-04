/**
 * Small fetch-based API client with interceptors (no extra dependencies).
 *
 *   import api from "@/api/apiHelper";
 *
 *   const patients = await api.get("/patients", { params: { page: 1 } });
 *   await api.post("/auth/login", { email, password });
 *
 * Every method resolves with the parsed response body and rejects with an
 * `ApiError` (non-2xx, network failure, timeout or abort).
 */

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://mediflow-backend-c3br.onrender.com";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, code = "API_ERROR", config } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = code; // HTTP_ERROR | NETWORK_ERROR | TIMEOUT | ABORTED
    this.config = config;
  }
}

/* ---------------------------- interceptor registry ---------------------------- */

const requestInterceptors = [];
const responseInterceptors = [];

/** Register an interceptor. Returns a function that removes it. */
function register(list, handlers) {
  const entry = handlers;
  list.push(entry);
  return () => {
    const i = list.indexOf(entry);
    if (i !== -1) list.splice(i, 1);
  };
}

export const interceptors = {
  /**
   * @param {(config) => config | Promise<config>} onRequest  runs before the call; return the config
   * @param {(error) => any} [onError]  runs if an earlier request interceptor threw
   */
  request: {
    use: (onRequest, onError) => register(requestInterceptors, { onRequest, onError }),
  },
  /**
   * @param {(response) => response | Promise<response>} onResponse  runs on 2xx; response = { data, status, headers, config }
   * @param {(error: ApiError) => any} [onError]  runs on failure; return a value to recover, or throw
   */
  response: {
    use: (onResponse, onError) => register(responseInterceptors, { onResponse, onError }),
  },
};

/* --------------------------------- helpers ----------------------------------- */

let tokenProvider = () => null;
let unauthorizedHandler = null;

/** Tell the client where to read the auth token from, e.g. () => localStorage.getItem("token"). */
export const setAuthTokenProvider = (fn) => {
  tokenProvider = fn;
};

/** Called once per 401 response (e.g. clear the session and redirect to /login). */
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

function buildUrl(url, params) {
  const full = /^https?:\/\//i.test(url) ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  if (!params) return full;

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else search.append(key, value);
  });
  const qs = search.toString();
  if (!qs) return full;
  return `${full}${full.includes("?") ? "&" : "?"}${qs}`;
}

async function parseBody(res) {
  if (res.status === 204) return null;
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("application/json")) return res.json().catch(() => null);
  if (type.startsWith("text/")) return res.text();
  return res.blob();
}

// FastAPI sends `detail` as a string (HTTP errors) or a list of { msg } (422 validation).
function errorMessage(data, fallback) {
  const detail = data && typeof data === "object" ? (data.detail ?? data.message) : null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback || "Request failed";
}

/* -------------------------------- core request ------------------------------- */

async function runRequestInterceptors(config) {
  let current = config;
  for (const { onRequest, onError } of requestInterceptors) {
    try {
      if (onRequest) current = (await onRequest(current)) ?? current;
    } catch (err) {
      if (!onError) throw err;
      current = (await onError(err)) ?? current;
    }
  }
  return current;
}

async function runResponseInterceptors(settled) {
  // `settled` is either a response object or an ApiError; each handler may
  // recover from an error (return a value) or transform a success.
  let current = settled;
  for (const { onResponse, onError } of responseInterceptors) {
    try {
      if (current instanceof ApiError) {
        if (onError) current = await onError(current);
      } else if (onResponse) {
        current = (await onResponse(current)) ?? current;
      }
    } catch (err) {
      current = err;
    }
  }
  if (current instanceof Error) throw current;
  return current;
}

async function send(config) {
  const { url, params, body, timeout = DEFAULT_TIMEOUT_MS, signal, headers, ...init } = config;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const hasJsonBody = body !== undefined && body !== null && !isFormData && typeof body !== "string";

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeout);
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(buildUrl(url, params), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: hasJsonBody ? JSON.stringify(body) : body,
      signal: controller.signal,
    });

    const data = await parseBody(res);
    const response = { data, status: res.status, headers: res.headers, config };

    if (!res.ok) {
      throw new ApiError(errorMessage(data, res.statusText), {
        status: res.status,
        data,
        code: "HTTP_ERROR",
        config,
      });
    }
    return response;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      throw new ApiError(timedOut ? "Request timed out" : "Request was cancelled", {
        code: timedOut ? "TIMEOUT" : "ABORTED",
        config,
      });
    }
    throw new ApiError("Network error. Please check your connection.", { code: "NETWORK_ERROR", config });
  } finally {
    clearTimeout(timer);
  }
}

async function request(config) {
  let settled;
  try {
    const finalConfig = await runRequestInterceptors({ method: "GET", ...config });
    settled = await send(finalConfig);
  } catch (err) {
    settled = err instanceof ApiError ? err : new ApiError(err?.message ?? "Request failed", { config });
  }
  const result = await runResponseInterceptors(settled);
  return result.data;
}

/* ------------------------------ default interceptors ------------------------- */

// Attach the bearer token (skip with `{ auth: false }` on a call).
interceptors.request.use((config) => {
  if (config.auth === false) return config;
  const token = tokenProvider();
  if (!token) return config;
  return { ...config, headers: { ...config.headers, Authorization: `Bearer ${token}` } };
});

// Surface 401s to the app once, then keep rejecting so callers can still react.
interceptors.response.use(undefined, (error) => {
  if (error.status === 401 && error.config?.auth !== false) unauthorizedHandler?.(error);
  throw error;
});

/* ---------------------------------- public API -------------------------------- */

const api = {
  request,
  get: (url, config) => request({ ...config, url, method: "GET" }),
  delete: (url, config) => request({ ...config, url, method: "DELETE" }),
  post: (url, body, config) => request({ ...config, url, body, method: "POST" }),
  put: (url, body, config) => request({ ...config, url, body, method: "PUT" }),
  patch: (url, body, config) => request({ ...config, url, body, method: "PATCH" }),
  interceptors,
};

export default api;
