import { apiClient } from "./client";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CouplePublicResponse {
  id: string;
  name: string;
  email: string;
}

export async function registerCouple(
  data: RegisterRequest
): Promise<CouplePublicResponse> {
  return apiClient<CouplePublicResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginCouple(
  data: LoginRequest
): Promise<TokenResponse> {
  return apiClient<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<CouplePublicResponse> {
  return apiClient<CouplePublicResponse>("/auth/me", {
    method: "GET",
  });
}

export async function refreshTokens(
  refreshToken: string
): Promise<TokenResponse> {
  return apiClient<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}
