import { apiClient } from "./client";

export interface ReservationInfo {
  id: string;
  guest_name: string;
  guest_email: string;
  reserved_at: string;
}

export interface GiftResponse {
  id: string;
  gift_list_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  price?: number | string | null;
  store_link?: string | null;
  is_reserved: boolean;
  created_at: string;
  reservation?: ReservationInfo | null;
}

export interface GiftListCreateRequest {
  title: string;
  wedding_date?: string | null;
}

export interface GiftListUpdateRequest {
  title?: string;
  wedding_date?: string | null;
}

export interface GiftListResponse {
  id: string;
  couple_id: string;
  public_token: string;
  title: string;
  wedding_date?: string | null;
  created_at: string;
  gifts: GiftResponse[];
}

export async function createList(
  data: GiftListCreateRequest
): Promise<GiftListResponse> {
  return apiClient<GiftListResponse>("/lists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getLists(): Promise<GiftListResponse[]> {
  return apiClient<GiftListResponse[]>("/lists", {
    method: "GET",
  });
}

export async function getList(id: string): Promise<GiftListResponse> {
  return apiClient<GiftListResponse>(`/lists/${id}`, {
    method: "GET",
  });
}

export async function updateList(
  id: string,
  data: GiftListUpdateRequest
): Promise<GiftListResponse> {
  return apiClient<GiftListResponse>(`/lists/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteList(id: string): Promise<void> {
  return apiClient<void>(`/lists/${id}`, {
    method: "DELETE",
  });
}
