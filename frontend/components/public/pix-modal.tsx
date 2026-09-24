"use client";

import { useEffect, useState } from "react";
import {
  X,
  QrCode,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getPixQrCode, PixQrCodeResponse } from "@/lib/api/public";
import { Button } from "@/components/ui/button";

interface PixModalProps {
  publicToken: string;
  coupleName: string;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [
  { label: "Valor Livre", value: undefined },
  { label: "R$ 50", value: 50 },
  { label: "R$ 100", value: 100 },
  { label: "R$ 200", value: 200 },
  { label: "R$ 500", value: 500 },
];

export function PixModal({
  publicToken,
  coupleName,
  isOpen,
  onClose,
}: PixModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>(undefined);
  const [customAmountInput, setCustomAmountInput] = useState<string>("");
  const [pixData, setPixData] = useState<PixQrCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchPix = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPixQrCode(publicToken, selectedAmount);
        if (isMounted) {
          setPixData(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os dados do Pix."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPix();

    return () => {
      isMounted = false;
    };
  }, [isOpen, publicToken, selectedAmount]);

  if (!isOpen) return null;

  const handleCopyPayload = async () => {
    if (!pixData?.pix_copy_paste) return;
    try {
      await navigator.clipboard.writeText(pixData.pix_copy_paste);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = pixData.pix_copy_paste;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2500);
    }
  };

  const handleCopyKey = async () => {
    if (!pixData?.pix_key) return;
    try {
      await navigator.clipboard.writeText(pixData.pix_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = pixData.pix_key;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const handleCustomAmountApply = () => {
    const parsed = parseFloat(customAmountInput.replace(",", "."));
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedAmount(parsed);
    } else {
      setSelectedAmount(undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-xl border border-[#E8E2D8] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E9B8D] hover:text-[#182319] rounded-lg p-1.5 hover:bg-[#F2ECE3] transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <QrCode className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-bold text-[#182319]">
            Presentear com Pix
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#5B6A5A] mb-4">
          Faça uma contribuição em dinheiro diretamente para a conta dos noivos,
          sem taxas, comissões ou intermediários.
        </p>

        {/* Amount Presets */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#182319] mb-2">
            Escolha o valor da contribuição (opcional):
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2.5">
            {PRESET_AMOUNTS.map((preset) => {
              const isSelected = selectedAmount === preset.value;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(preset.value);
                    setCustomAmountInput("");
                  }}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold border transition-all text-center ${
                    isSelected
                      ? "bg-[#384C37] text-white border-[#384C37] shadow-xs"
                      : "bg-[#FAF8F5] text-[#2D3E2C] border-[#E8E2D8] hover:border-[#384C37]"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom amount input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-xs font-bold text-[#7A8A79]">
                R$
              </span>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="Outro valor..."
                value={customAmountInput}
                onChange={(e) => setCustomAmountInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCustomAmountApply();
                  }
                }}
                className="w-full rounded-xl border border-[#D8D0C3] bg-white pl-9 pr-3 py-1.5 text-xs text-[#182319] placeholder:text-[#A1ADA0] focus:border-[#384C37] focus:outline-none"
              />
            </div>
            {customAmountInput && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCustomAmountApply}
                className="text-xs"
              >
                Definir
              </Button>
            )}
          </div>
        </div>

        {/* Loading / Error / Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8]">
            <Loader2 className="h-8 w-8 animate-spin text-[#384C37] mb-2" />
            <p className="text-xs text-[#5B6A5A]">Gerando QR Code Pix...</p>
          </div>
        ) : error ? (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="mt-1 text-rose-700">
                Os noivos ainda estão configurando a chave Pix da lista.
              </p>
            </div>
          </div>
        ) : pixData ? (
          <div className="space-y-4">
            {/* QR Code Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E2D8] bg-[#FAF8F5] p-5">
              <div className="bg-white p-3 rounded-xl border border-[#E8E2D8] shadow-xs mb-3">
                <img
                  src={pixData.qr_code_base64}
                  alt="QR Code Pix"
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-[#182319]">
                  {pixData.merchant_name || coupleName}
                </p>
                {selectedAmount ? (
                  <p className="text-sm font-extrabold text-[#384C37] mt-0.5">
                    {Number(selectedAmount).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                ) : (
                  <p className="text-xs text-[#7A8A79] mt-0.5 italic">
                    Valor livre (defina no app do seu banco)
                  </p>
                )}
              </div>
            </div>

            {/* Pix Copia e Cola button */}
            <div>
              <Button
                onClick={handleCopyPayload}
                variant="primary"
                className="w-full gap-2 py-2.5 font-semibold text-sm"
              >
                {copiedPayload ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>Código Pix Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copiar Pix Copia e Cola</span>
                  </>
                )}
              </Button>
            </div>

            {/* Pix Key details */}
            <div className="rounded-xl border border-[#E8E2D8] bg-white p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#7A8A79]">Chave Pix ({pixData.pix_key_type || "Chave"}):</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="inline-flex items-center gap-1 font-mono font-medium text-[#384C37] hover:underline"
                >
                  <span className="truncate max-w-[200px]">{pixData.pix_key}</span>
                  {copiedKey ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[#7A8A79] border-t border-[#F2ECE3] pt-2">
                <span>Recebedor:</span>
                <span className="font-semibold text-[#182319]">{pixData.merchant_name}</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-[#EAF0E9] p-3 text-[11px] text-[#2D3E2C] space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#384C37]" />
                Como transferir via Pix:
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-[#465F45]">
                <li>Abra o aplicativo do seu banco</li>
                <li>Selecione Pix e escaneie o QR Code ou cole o código Copia e Cola</li>
                <li>Confira o nome do destinatário e conclua o envio</li>
              </ol>
            </div>
          </div>
        ) : null}

        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full text-xs"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
