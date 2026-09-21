"use client";

import { useState, useEffect } from "react";
import { X, Gift, DollarSign, Link as LinkIcon, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GiftResponse } from "@/lib/api/list";
import { GiftCreateRequest, GiftUpdateRequest } from "@/lib/api/gifts";

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GiftCreateRequest | GiftUpdateRequest) => Promise<void>;
  initialData?: GiftResponse | null;
  isLoading?: boolean;
}

export function GiftModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: GiftModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [storeLink, setStoreLink] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setPrice(initialData.price !== null && initialData.price !== undefined ? String(initialData.price) : "");
      setImageUrl(initialData.image_url || "");
      setStoreLink(initialData.store_link || "");
      setDescription(initialData.description || "");
    } else {
      setName("");
      setPrice("");
      setImageUrl("");
      setStoreLink("");
      setDescription("");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("O nome do presente é obrigatório.");
      return;
    }

    let parsedPrice: number | null = null;
    if (price.trim()) {
      const sanitized = price.replace(",", ".");
      const num = parseFloat(sanitized);
      if (isNaN(num) || num < 0) {
        setError("Informe um valor válido em reais (ex: 150.00).");
        return;
      }
      parsedPrice = num;
    }

    try {
      await onSubmit({
        name: name.trim(),
        price: parsedPrice,
        image_url: imageUrl.trim() || null,
        store_link: storeLink.trim() || null,
        description: description.trim() || null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao salvar presente");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#E8E2D8] shadow-2xl p-6 sm:p-7 text-[#222B23] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#182319]">
                {initialData ? "Editar Presente" : "Adicionar Novo Presente"}
              </h3>
              <p className="text-xs text-[#5B6A5A]">
                {initialData
                  ? "Atualize as informações do item"
                  : "Cadastre um presente para sua lista"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B776E] hover:bg-[#F2ECE3] hover:text-[#182319] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input
            label="Nome do Presente *"
            placeholder="Ex: Jogo de Panelas Antiaderente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valor Sugerido (R$)"
              type="text"
              placeholder="Ex: 350,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              icon={<DollarSign className="h-4 w-4" />}
              helperText="Opcional. Valor para referência ou Pix."
            />

            <Input
              label="Link da Loja"
              type="url"
              placeholder="https://..."
              value={storeLink}
              onChange={(e) => setStoreLink(e.target.value)}
              icon={<LinkIcon className="h-4 w-4" />}
              helperText="Onde o convidado pode comprar."
            />
          </div>

          <Input
            label="URL da Imagem"
            type="url"
            placeholder="https://exemplo.com/foto.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            icon={<ImageIcon className="h-4 w-4" />}
            helperText="Link direto de uma foto do produto."
          />

          {/* Image Preview if provided */}
          {imageUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5]">
              <img
                src={imageUrl}
                alt="Pré-visualização"
                className="h-16 w-16 object-cover rounded-lg border border-[#E8E2D8]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="text-xs text-[#5B6A5A]">Pré-visualização da imagem</span>
            </div>
          )}

          <div className="w-full space-y-1.5 text-left">
            <label className="block text-sm font-medium text-[#222B23]">
              Descrição ou Recado aos Convidados
            </label>
            <textarea
              rows={3}
              className="block w-full rounded-xl border border-[#D8D0C3] bg-white px-3.5 py-2.5 text-sm text-[#1A231B] placeholder:text-[#8E9B8D] focus:border-[#384C37] focus:outline-none focus:ring-2 focus:ring-[#EAF0E9]"
              placeholder="Ex: Gostaríamos muito na cor preta ou grafite. Obrigado pelo carinho!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E2D8]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              {initialData ? "Salvar Alterações" : "Adicionar Presente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
