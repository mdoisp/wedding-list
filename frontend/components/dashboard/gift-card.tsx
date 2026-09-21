"use client";

import { useState } from "react";
import { Edit2, Trash2, ExternalLink, CheckCircle2, Gift as GiftIcon, UserCheck, AlertTriangle } from "lucide-react";
import { GiftResponse } from "@/lib/api/list";
import { Button } from "@/components/ui/button";

interface GiftCardProps {
  gift: GiftResponse;
  onEdit: (gift: GiftResponse) => void;
  onDelete: (giftId: string) => Promise<void>;
}

export function GiftCard({ gift, onEdit, onDelete }: GiftCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formattedPrice =
    gift.price !== null && gift.price !== undefined
      ? Number(gift.price).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(gift.id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#E8E2D8] bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-md relative overflow-hidden group">
      {/* Top Image or Icon */}
      <div>
        <div className="relative h-44 w-full overflow-hidden rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] mb-4 flex items-center justify-center">
          {gift.image_url ? (
            <img
              src={gift.image_url}
              alt={gift.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#8E9B8D]">
              <GiftIcon className="h-10 w-10 mb-1 stroke-1" />
              <span className="text-xs">Sem foto</span>
            </div>
          )}

          {/* Reserved Status Pill */}
          <div className="absolute top-3 right-3">
            {gift.is_reserved ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 text-white px-2.5 py-1 text-xs font-semibold shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Reservado
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-white/90 text-[#384C37] px-2.5 py-1 text-xs font-semibold border border-[#D5DFD3] shadow-xs backdrop-blur-xs">
                Disponível
              </span>
            )}
          </div>
        </div>

        {/* Gift Information */}
        <h4 className="text-base font-bold text-[#182319] line-clamp-1 mb-1" title={gift.name}>
          {gift.name}
        </h4>

        {formattedPrice && (
          <p className="text-lg font-extrabold text-[#384C37] mb-2">
            {formattedPrice}
          </p>
        )}

        {gift.description && (
          <p className="text-xs text-[#5B6A5A] line-clamp-2 mb-3">
            {gift.description}
          </p>
        )}

        {/* Store link if available */}
        {gift.store_link && (
          <a
            href={gift.store_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#465F45] hover:text-[#182319] hover:underline mb-3"
          >
            <span>Ver na loja</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Reservation details if reserved */}
        {gift.is_reserved && gift.reservation && (
          <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 mb-3">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <UserCheck className="h-3.5 w-3.5" />
              <span>Reservado por:</span>
            </div>
            <p className="font-bold mt-0.5">{gift.reservation.guest_name}</p>
            <p className="text-emerald-700 text-[11px] truncate">{gift.reservation.guest_email}</p>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-[#E8E2D8] mt-3">
        {confirmDelete ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Confirmar?
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs px-2 py-1 h-7"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Não
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="text-xs px-2.5 py-1 h-7 bg-rose-700 hover:bg-rose-800 text-white"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Sim, excluir
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1 py-1 h-8"
              onClick={() => onEdit(gift)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 py-1 h-8"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
