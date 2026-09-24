import { apiClient } from "./client";

export interface PublicGift {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  price?: number | string | null;
  store_link?: string | null;
  is_reserved: boolean;
}

export interface PublicGiftList {
  id: string;
  public_token: string;
  title: string;
  wedding_date?: string | null;
  couple_name: string;
  has_pix: boolean;
  gifts: PublicGift[];
}

export interface ReserveGiftRequest {
  guest_name: string;
  guest_email: string;
}

export interface ReservationResponse {
  id: string;
  gift_id: string;
  guest_name: string;
  guest_email: string;
  reserved_at: string;
}

export interface PixQrCodeResponse {
  public_token: string;
  pix_key: string;
  pix_key_type: string;
  merchant_name: string;
  merchant_city: string;
  amount: number | null;
  pix_copy_paste: string;
  qr_code_base64: string;
}

export async function getPublicList(
  publicToken: string
): Promise<PublicGiftList> {
  return apiClient<PublicGiftList>(`/public/${publicToken}`, {
    method: "GET",
    // Ensure we don't cache aggressively on client/server so status updates quickly
    cache: "no-store",
  });
}

export async function reserveGift(
  publicToken: string,
  giftId: string,
  data: ReserveGiftRequest
): Promise<ReservationResponse> {
  return apiClient<ReservationResponse>(
    `/public/${publicToken}/gifts/${giftId}/reserve`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function getPixQrCode(
  publicToken: string,
  amount?: number
): Promise<PixQrCodeResponse> {
  const query = new URLSearchParams({ format: "json" });
  if (amount !== undefined && amount > 0) {
    query.set("amount", amount.toString());
  }

  return apiClient<PixQrCodeResponse>(
    `/public/${publicToken}/pix-qrcode?${query.toString()}`,
    {
      method: "GET",
    }
  );
}
