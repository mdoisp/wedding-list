import { getCookie } from "../cookies";

export function getApiBaseUrl(): string {
  // 1. Explicit env variable (if defined at build or runtime)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  // 2. Client-side browser inspection
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
    // Production (Vercel, custom domains, etc.)
    return "https://backend-wedding-list.up.railway.app";
  }

  // 3. Server-side Next.js fallback
  return process.env.NODE_ENV === "production"
    ? "https://backend-wedding-list.up.railway.app"
    : "http://localhost:8000";
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token = getCookie("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}`;
    let errorData: unknown = null;

    try {
      errorData = await response.json();
      if (typeof errorData === "object" && errorData !== null && "detail" in errorData) {
        const detail = (errorData as { detail: unknown }).detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((err) => err.msg || JSON.stringify(err)).join(", ");
        }
      }
    } catch {
      // Body not JSON
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
