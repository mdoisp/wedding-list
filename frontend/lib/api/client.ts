import { getCookie } from "../cookies";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

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
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

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
