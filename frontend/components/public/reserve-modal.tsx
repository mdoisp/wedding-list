"use client";

import { useState } from "react";
import {
  X,
  Heart,
  CheckCircle2,
  ExternalLink,
  Gift as GiftIcon,
  AlertCircle,
  Mail,
  User,
  Sparkles,
} from "lucide-react";
import { PublicGift, reserveGift } from "@/lib/api/public";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReserveModalProps {
  gift: PublicGift | null;
  publicToken: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (giftId: string) => void;
}

export function ReserveModal({
  gift,
  publicToken,
  isOpen,
  onClose,
  onSuccess,
}: ReserveModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservedDetails, setReservedDetails] = useState<{
    name: string;
    email: string;
  } | null>(null);

  if (!isOpen || !gift) return null;

  const formattedPrice =
    gift.price !== null && gift.price !== undefined
      ? Number(gift.price).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : null;

  const handleClose = () => {
    setName("");
    setEmail("");
    setErrorMessage(null);
    setIsSuccess(false);
    setReservedDetails(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Por favor, informe seu nome completo.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage("Por favor, informe um endereço de e-mail válido.");
      return;
    }

    setIsLoading(true);
    try {
      await reserveGift(publicToken, gift.id, {
        guest_name: trimmedName,
        guest_email: trimmedEmail,
      });

      setIsSuccess(true);
      setReservedDetails({
        name: trimmedName,
        email: trimmedEmail,
      });
      onSuccess(gift.id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao reservar presente.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-xl border border-[#E8E2D8] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#8E9B8D] hover:text-[#182319] rounded-lg p-1.5 hover:bg-[#F2ECE3] transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="text-center py-2 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-700" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Reserva confirmada
              </div>
              <h3 className="text-xl font-bold text-[#182319]">
                Obrigado pelo seu carinho!
              </h3>
              <p className="text-sm text-[#5B6A5A] mt-1">
                Sua reserva foi registrada e os noivos serão notificados.
              </p>
            </div>

            {/* Reserved Item Summary */}
            <div className="rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-4 text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-[#7A8A79] border-b border-[#E8E2D8] pb-2">
                <span>Presente escolhido</span>
                {formattedPrice && (
                  <span className="font-bold text-[#384C37]">
                    {formattedPrice}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-[#182319]">{gift.name}</p>

              {reservedDetails && (
                <div className="pt-2 text-xs text-[#5B6A5A] space-y-1">
                  <p>
                    <span className="font-medium text-[#182319]">Convidado:</span>{" "}
                    {reservedDetails.name}
                  </p>
                  <p>
                    <span className="font-medium text-[#182319]">E-mail:</span>{" "}
                    {reservedDetails.email}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-[#5B6A5A] leading-relaxed">
              Enviamos um e-mail de confirmação para{" "}
              <strong className="text-[#182319]">
                {reservedDetails?.email}
              </strong>{" "}
              com os detalhes do presente e recomendações para entrega aos noivos.
            </p>

            {/* Optional store link button */}
            {gift.store_link && (
              <a
                href={gift.store_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full gap-2 border-[#384C37] text-[#384C37] hover:bg-[#EAF0E9]"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Acessar loja sugerida para compra</span>
                </Button>
              </a>
            )}

            <Button
              onClick={handleClose}
              variant="primary"
              className="w-full mt-2"
            >
              Concluir e voltar à lista
            </Button>
          </div>
        ) : (
          /* Reservation Form */
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100">
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </span>
              <h3 className="text-lg font-bold text-[#182319]">
                Presentear os Noivos
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#5B6A5A] mb-4">
              Ao reservar, o item fica indisponível para outros convidados e você
              assume o compromisso com os noivos de presenteá-los com este item.
            </p>

            {/* Gift Preview Card */}
            <div className="flex items-center gap-3.5 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] p-3.5 mb-5">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white border border-[#E8E2D8] flex items-center justify-center">
                {gift.image_url ? (
                  <img
                    src={gift.image_url}
                    alt={gift.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <GiftIcon className="h-6 w-6 text-[#8E9B8D]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#182319] truncate">
                  {gift.name}
                </h4>
                {formattedPrice ? (
                  <p className="text-sm font-extrabold text-[#384C37]">
                    {formattedPrice}
                  </p>
                ) : (
                  <p className="text-xs text-[#7A8A79] italic">Valor livre</p>
                )}
                {gift.store_link && (
                  <a
                    href={gift.store_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#465F45] hover:underline mt-0.5"
                  >
                    <span>Ver loja sugerida</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="guest-name"
                  className="block text-xs font-semibold text-[#182319] mb-1.5"
                >
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <Input
                    id="guest-name"
                    type="text"
                    required
                    placeholder="Ex: Ana Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                    disabled={isLoading}
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-[#8E9B8D]" />
                </div>
                <p className="text-[11px] text-[#7A8A79] mt-1">
                  Os noivos saberão quem reservou com carinho este presente.
                </p>
              </div>

              <div>
                <label
                  htmlFor="guest-email"
                  className="block text-xs font-semibold text-[#182319] mb-1.5"
                >
                  Seu E-mail *
                </label>
                <div className="relative">
                  <Input
                    id="guest-email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#8E9B8D]" />
                </div>
                <p className="text-[11px] text-[#7A8A79] mt-1">
                  Enviaremos a confirmação da sua reserva e o link do presente.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="sm:w-1/3 order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="sm:w-2/3 order-1 sm:order-2 font-semibold"
                >
                  Confirmar Reserva
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
