"use client";

import { ExternalLink, Gift as GiftIcon, Heart, Check } from "lucide-react";
import { PublicGift } from "@/lib/api/public";
import { Button } from "@/components/ui/button";

interface PublicGiftCardProps {
  gift: PublicGift;
  onReserve: (gift: PublicGift) => void;
}

export function PublicGiftCard({ gift, onReserve }: PublicGiftCardProps) {
  const formattedPrice =
    gift.price !== null && gift.price !== undefined
      ? Number(gift.price).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : null;

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
        gift.is_reserved
          ? "border-[#E8E2D8] bg-[#FAF8F5]/60 opacity-80"
          : "border-[#E8E2D8] bg-white shadow-xs hover:shadow-md hover:border-[#D5DFD3]"
      }`}
    >
      <div>
        {/* Gift Image or Fallback */}
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-[#FAF8F5] border-b border-[#E8E2D8] flex items-center justify-center">
          {gift.image_url ? (
            <img
              src={gift.image_url}
              alt={gift.name}
              className={`h-full w-full object-cover transition-transform duration-500 ${
                gift.is_reserved ? "grayscale-[30%]" : "group-hover:scale-105"
              }`}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#8E9B8D] p-6 text-center">
              <GiftIcon className="h-10 w-10 mb-1.5 stroke-1" />
              <span className="text-xs">Sem foto</span>
            </div>
          )}

          {/* Reserved Status Overlay / Badge */}
          <div className="absolute top-3 right-3">
            {gift.is_reserved ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#384C37] text-white px-3 py-1 text-xs font-semibold shadow-xs">
                <Check className="h-3.5 w-3.5" />
                Presente Reservado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 text-[#384C37] px-3 py-1 text-xs font-semibold border border-[#D5DFD3] shadow-xs backdrop-blur-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Disponível
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <h4
            className="text-base font-bold text-[#182319] line-clamp-1 mb-1.5"
            title={gift.name}
          >
            {gift.name}
          </h4>

          {formattedPrice ? (
            <p className="text-xl font-extrabold text-[#384C37] mb-2.5">
              {formattedPrice}
            </p>
          ) : (
            <p className="text-xs font-medium text-[#7A8A79] mb-2.5 italic">
              Valor simbólico / À sua escolha
            </p>
          )}

          {gift.description && (
            <p className="text-xs text-[#5B6A5A] line-clamp-2 leading-relaxed mb-3">
              {gift.description}
            </p>
          )}

          {/* Store link if available */}
          {gift.store_link && (
            <a
              href={gift.store_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#465F45] hover:text-[#182319] hover:underline mb-1"
            >
              <span>Ver sugestão na loja</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0">
        {gift.is_reserved ? (
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F2ECE3] py-2.5 px-4 text-xs font-semibold text-[#5B6A5A]">
            <Heart className="h-3.5 w-3.5 fill-[#5B6A5A] text-[#5B6A5A]" />
            <span>Já escolhido por um convidado</span>
          </div>
        ) : (
          <Button
            onClick={() => onReserve(gift)}
            variant="primary"
            className="w-full gap-2 shadow-sm font-semibold"
          >
            <GiftIcon className="h-4 w-4" />
            <span>Presentear este item</span>
          </Button>
        )}
      </div>
    </div>
  );
}
