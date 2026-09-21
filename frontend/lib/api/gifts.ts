import { apiClient } from "./client";
import { GiftResponse } from "./list";

export interface GiftCreateRequest {
  name: string;
  description?: string | null;
  image_url?: string | null;
  price?: number | null;
  store_link?: string | null;
}

export interface GiftUpdateRequest {
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  price?: number | null;
  store_link?: string | null;
}

export async function addGift(
  listId: string,
  data: GiftCreateRequest
): Promise<GiftResponse> {
  return apiClient<GiftResponse>(`/lists/${listId}/gifts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listGifts(listId: string): Promise<GiftResponse[]> {
  return apiClient<GiftResponse[]>(`/lists/${listId}/gifts`, {
    method: "GET",
  });
}

export async function getGift(
  listId: string,
  giftId: string
): Promise<GiftResponse> {
  return apiClient<GiftResponse>(`/lists/${listId}/gifts/${giftId}`, {
    method: "GET",
  });
}

export async function updateGift(
  listId: string,
  giftId: string,
  data: GiftUpdateRequest
): Promise<GiftResponse> {
  return apiClient<GiftResponse>(`/lists/${listId}/gifts/${giftId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteGift(
  listId: string,
  giftId: string
): Promise<void> {
  return apiClient<void>(`/lists/${listId}/gifts/${giftId}`, {
    method: "DELETE",
  });
}
