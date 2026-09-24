"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  Calendar,
  Gift,
  Search,
  Filter,
  ArrowUpDown,
  QrCode,
  Sparkles,
  CheckCircle,
  Clock,
  Check,
} from "lucide-react";
import { PublicGift, PublicGiftList } from "@/lib/api/public";
import { PublicGiftCard } from "./public-gift-card";
import { ReserveModal } from "./reserve-modal";
import { PixModal } from "./pix-modal";
import { Button } from "@/components/ui/button";

interface PublicListViewProps {
  initialList: PublicGiftList;
}

export function PublicListView({ initialList }: PublicListViewProps) {
  const [list, setList] = useState<PublicGiftList>(initialList);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "reserved">("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name">("default");

  // Modals state
  const [selectedGift, setSelectedGift] = useState<PublicGift | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Formatted date and countdown
  const formattedDate = useMemo(() => {
    if (!list.wedding_date) return null;
    try {
      const parts = list.wedding_date.split("-");
      if (parts.length === 3) {
        const date = new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        );
        return date.toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      return new Date(list.wedding_date).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return list.wedding_date;
    }
  }, [list.wedding_date]);

  const daysRemaining = useMemo(() => {
    if (!list.wedding_date) return null;
    try {
      const parts = list.wedding_date.split("-");
      const weddingDate =
        parts.length === 3
          ? new Date(
              parseInt(parts[0], 10),
              parseInt(parts[1], 10) - 1,
              parseInt(parts[2], 10)
            )
          : new Date(list.wedding_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      weddingDate.setHours(0, 0, 0, 0);
      const diffTime = weddingDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) return `Faltam ${diffDays} dias`;
      if (diffDays === 0) return "É hoje! 🎉";
      return null;
    } catch {
      return null;
    }
  }, [list.wedding_date]);

  // Statistics
  const totalGifts = list.gifts.length;
  const reservedGifts = list.gifts.filter((g) => g.is_reserved).length;
  const availableGifts = totalGifts - reservedGifts;

  // Filtered & Sorted gifts
  const filteredGifts = useMemo(() => {
    return list.gifts
      .filter((gift) => {
        // Status filter
        if (statusFilter === "available" && gift.is_reserved) return false;
        if (statusFilter === "reserved" && !gift.is_reserved) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = gift.name.toLowerCase().includes(q);
          const matchDesc = gift.description?.toLowerCase().includes(q) ?? false;
          if (!matchName && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (sortBy === "price-desc") {
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name, "pt-BR");
        }
        // Default: available gifts first, then original order
        if (a.is_reserved !== b.is_reserved) {
          return a.is_reserved ? 1 : -1;
        }
        return 0;
      });
  }, [list.gifts, statusFilter, searchQuery, sortBy]);

  const handleOpenReserve = (gift: PublicGift) => {
    setSelectedGift(gift);
    setIsReserveModalOpen(true);
  };

  const handleReserveSuccess = (giftId: string) => {
    setList((prev) => ({
      ...prev,
      gifts: prev.gifts.map((g) =>
        g.id === giftId ? { ...g, is_reserved: true } : g
      ),
    }));

    setToast("Presente reservado com sucesso!");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl bg-[#384C37] text-white px-4 py-3 shadow-lg border border-[#2B3B2A] animate-in slide-in-from-top-4 duration-300">
          <CheckCircle className="h-5 w-5 text-emerald-300" />
          <span className="text-xs sm:text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Hero / Header Section */}
      <section className="relative overflow-hidden border-b border-[#E8E2D8] bg-gradient-to-b from-[#F2ECE3]/80 via-[#FAF8F5] to-[#FAF8F5] py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Couple Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#384C37] shadow-xs border border-[#E8E2D8] mb-4">
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            <span>Lista de Casamento</span>
          </div>

          {/* Couple Names */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#182319] tracking-tight mb-3">
            {list.couple_name}
          </h1>

          {/* List Title */}
          <p className="text-lg sm:text-xl font-medium text-[#465F45] max-w-2xl mx-auto mb-4">
            {list.title}
          </p>

          {/* Wedding Date & Countdown */}
          {formattedDate && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[#5B6A5A] mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 border border-[#E8E2D8] shadow-2xs font-medium">
                <Calendar className="h-4 w-4 text-[#384C37]" />
                {formattedDate}
              </span>
              {daysRemaining && (
                <span className="inline-flex items-center gap-1 rounded-xl bg-[#EAF0E9] px-3 py-1.5 text-[#2D3E2C] font-semibold border border-[#D5DFD3]">
                  <Clock className="h-3.5 w-3.5 text-[#384C37]" />
                  {daysRemaining}
                </span>
              )}
            </div>
          )}

          {/* Pix Callout Card (Always available or if has_pix) */}
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#D5DFD3] bg-[#EAF0E9]/70 p-5 sm:p-6 shadow-xs backdrop-blur-xs text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#384C37] text-white">
                  <QrCode className="h-4 w-4" />
                </span>
                <h2 className="text-sm sm:text-base font-bold text-[#182319]">
                  Prefere presentear em dinheiro?
                </h2>
              </div>
              <p className="text-xs text-[#475746]">
                Faça uma contribuição Pix no valor que desejar diretamente aos noivos, sem intermediários.
              </p>
            </div>

            <Button
              onClick={() => setIsPixModalOpen(true)}
              variant="primary"
              size="sm"
              className="shrink-0 gap-2 font-semibold shadow-xs"
            >
              <QrCode className="h-4 w-4" />
              <span>Presentear via Pix</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Controls: Search, Filters, Stats */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar presentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#D8D0C3] bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-[#182319] placeholder:text-[#8E9B8D] focus:border-[#384C37] focus:outline-none shadow-2xs"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#8E9B8D]" />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <ArrowUpDown className="h-4 w-4 text-[#7A8A79]" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "default" | "price-asc" | "price-desc" | "name"
                  )
                }
                className="rounded-xl border border-[#D8D0C3] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#182319] focus:border-[#384C37] focus:outline-none shadow-2xs"
              >
                <option value="default">Ordem recomendada</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="name">Nome (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Pills & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E8E2D8]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? "bg-[#384C37] text-white shadow-xs"
                    : "bg-white text-[#465F45] border border-[#E8E2D8] hover:border-[#384C37]"
                }`}
              >
                Todos ({totalGifts})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("available")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "available"
                    ? "bg-[#384C37] text-white shadow-xs"
                    : "bg-white text-[#465F45] border border-[#E8E2D8] hover:border-[#384C37]"
                }`}
              >
                Disponíveis ({availableGifts})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("reserved")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "reserved"
                    ? "bg-[#384C37] text-white shadow-xs"
                    : "bg-white text-[#465F45] border border-[#E8E2D8] hover:border-[#384C37]"
                }`}
              >
                Reservados ({reservedGifts})
              </button>
            </div>

            <p className="text-xs text-[#7A8A79]">
              Exibindo <span className="font-bold text-[#182319]">{filteredGifts.length}</span>{" "}
              {filteredGifts.length === 1 ? "presente" : "presentes"}
            </p>
          </div>
        </div>

        {/* Gifts Grid */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGifts.map((gift) => (
              <PublicGiftCard
                key={gift.id}
                gift={gift}
                onReserve={handleOpenReserve}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter / List */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8D0C3] bg-white p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#8E9B8D] border border-[#E8E2D8] mb-3">
              <Gift className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-[#182319] mb-1">
              Nenhum presente encontrado
            </h3>
            <p className="text-xs sm:text-sm text-[#5B6A5A] max-w-sm mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Tente ajustar os filtros ou a busca para encontrar presentes."
                : "Os noivos ainda não adicionaram presentes a esta lista."}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D8] bg-white py-8 text-center text-xs text-[#7A8A79]">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span className="font-semibold text-[#182319]">Amor em Lista</span>
            <span>— Lista de Casamento 100% Gratuita</span>
          </div>

          <Link
            href="/"
            className="text-[#384C37] hover:underline font-medium"
          >
            Crie sua própria lista de casamento grátis
          </Link>
        </div>
      </footer>

      {/* Modals */}
      <ReserveModal
        gift={selectedGift}
        publicToken={list.public_token}
        isOpen={isReserveModalOpen}
        onClose={() => {
          setIsReserveModalOpen(false);
          setSelectedGift(null);
        }}
        onSuccess={handleReserveSuccess}
      />

      <PixModal
        publicToken={list.public_token}
        coupleName={list.couple_name}
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
      />
    </div>
  );
}
