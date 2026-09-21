"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Gift as GiftIcon,
  CheckCircle2,
  Clock,
  Plus,
  Settings,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  Coins,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { getLists, createList, GiftListResponse, GiftResponse } from "@/lib/api/list";
import { addGift, updateGift, deleteGift, GiftCreateRequest, GiftUpdateRequest } from "@/lib/api/gifts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GiftCard } from "@/components/dashboard/gift-card";
import { GiftModal } from "@/components/dashboard/gift-modal";
import { ShareBanner } from "@/components/dashboard/share-banner";
import { ReservationsTable } from "@/components/dashboard/reservations-table";

export default function DashboardPage() {
  const router = useRouter();
  const { couple, isAuthenticated, logout, checkAuth } = useAuthStore();

  const [list, setList] = useState<GiftListResponse | null>(null);
  const [gifts, setGifts] = useState<GiftResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingList, setCreatingList] = useState(false);

  // Filters: "all" | "available" | "reserved"
  const [filter, setFilter] = useState<"all" | "available" | "reserved">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const lists = await getLists();
      if (lists && lists.length > 0) {
        const primaryList = lists[0];
        setList(primaryList);
        setGifts(primaryList.gifts || []);
      } else {
        setList(null);
        setGifts([]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInitialList = async () => {
    setCreatingList(true);
    try {
      const newList = await createList({
        title: couple?.name ? `Lista de Casamento de ${couple.name}` : "Nossa Lista de Casamento",
      });
      setList(newList);
      setGifts(newList.gifts || []);
    } catch (err) {
      console.error("Erro ao criar lista inicial:", err);
    } finally {
      setCreatingList(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedGift(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (gift: GiftResponse) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const handleSaveGift = async (data: GiftCreateRequest | GiftUpdateRequest) => {
    if (!list) return;
    setModalLoading(true);
    try {
      if (selectedGift) {
        // Edit
        await updateGift(list.id, selectedGift.id, data as GiftUpdateRequest);
      } else {
        // Add
        await addGift(list.id, data as GiftCreateRequest);
      }
      await loadData();
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!list) return;
    await deleteGift(list.id, giftId);
    setGifts((prev) => prev.filter((g) => g.id !== giftId));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const totalGifts = gifts.length;
    const reservedGifts = gifts.filter((g) => g.is_reserved).length;
    const availableGifts = totalGifts - reservedGifts;

    const totalReservedValue = gifts
      .filter((g) => g.is_reserved && g.price)
      .reduce((sum, g) => sum + Number(g.price), 0);

    const totalListValue = gifts
      .filter((g) => g.price)
      .reduce((sum, g) => sum + Number(g.price), 0);

    return {
      totalGifts,
      reservedGifts,
      availableGifts,
      totalReservedValue,
      totalListValue,
    };
  }, [gifts]);

  const filteredGifts = useMemo(() => {
    if (filter === "available") return gifts.filter((g) => !g.is_reserved);
    if (filter === "reserved") return gifts.filter((g) => g.is_reserved);
    return gifts;
  }, [gifts, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center text-[#5B6A5A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#384C37] mb-3" />
        <p className="text-sm font-medium">Carregando painel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#222B23]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#E8E2D8] bg-[#FAF8F5]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100 shadow-xs">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#182319]">
              Amor em Lista
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-[#2D3E2C] bg-white/70 hover:bg-white"
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Configurações e Pix</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-[#5B6A5A] hover:text-rose-700 gap-1.5 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF0E9] px-3 py-1 text-xs font-semibold text-[#384C37] mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Painel dos Noivos
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182319] tracking-tight">
              {couple?.name ? `Olá, ${couple.name}!` : "Bem-vindos!"}
            </h1>
            <p className="text-sm text-[#5B6A5A] mt-0.5">
              Gerencie seus presentes, acompanhe as reservas e compartilhe seu link exclusivo.
            </p>
          </div>

          {list && (
            <Button
              variant="primary"
              size="md"
              className="gap-2 shadow-sm self-start sm:self-auto"
              onClick={handleOpenAddModal}
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Presente</span>
            </Button>
          )}
        </div>

        {/* Warning if Pix Key is not configured yet */}
        {couple && !couple.pix_key && (
          <div className="mb-6 flex items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <span>
                <strong>Atenção:</strong> Sua chave Pix ainda não foi configurada. Cadastre sua chave para
                receber pagamentos diretamente na sua conta.
              </span>
            </div>
            <Link href="/dashboard/settings" className="shrink-0">
              <Button size="sm" variant="outline" className="text-xs bg-white text-amber-900 border-amber-300">
                Configurar Pix
              </Button>
            </Link>
          </div>
        )}

        {/* If couple does not have a list yet */}
        {!list ? (
          <Card className="border-[#E8E2D8] bg-white p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
            <CardContent className="space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF0E9] text-[#384C37] mx-auto">
                <GiftIcon className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-[#182319]">
                Vamos criar a sua primeira lista?
              </h2>
              <p className="text-sm text-[#5B6A5A] leading-relaxed">
                Com apenas um clique, criamos o link exclusivo do casal para você começar a cadastrar
                presentes e receber contribuições via Pix.
              </p>
              <div>
                <Button
                  variant="primary"
                  size="lg"
                  className="gap-2 mt-2"
                  onClick={handleCreateInitialList}
                  isLoading={creatingList}
                >
                  <Plus className="h-4 w-4" />
                  <span>Criar Minha Lista Agora</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Share Banner */}
            <ShareBanner publicToken={list.public_token} listTitle={list.title} />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="border-[#E8E2D8] bg-white shadow-xs">
                <CardContent className="p-5 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5B6A5A] uppercase tracking-wider">
                      Total na Lista
                    </p>
                    <h3 className="text-2xl font-extrabold text-[#182319]">
                      {stats.totalGifts}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E8E2D8] bg-white shadow-xs">
                <CardContent className="p-5 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5B6A5A] uppercase tracking-wider">
                      Reservados
                    </p>
                    <h3 className="text-2xl font-extrabold text-emerald-800">
                      {stats.reservedGifts}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E8E2D8] bg-white shadow-xs">
                <CardContent className="p-5 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5B6A5A] uppercase tracking-wider">
                      Disponíveis
                    </p>
                    <h3 className="text-2xl font-extrabold text-[#182319]">
                      {stats.availableGifts}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E8E2D8] bg-white shadow-xs">
                <CardContent className="p-5 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5B6A5A] uppercase tracking-wider">
                      Total Reservado
                    </p>
                    <h3 className="text-xl font-extrabold text-[#384C37]">
                      {stats.totalReservedValue.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="inline-flex rounded-xl bg-[#F2ECE3] p-1 border border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filter === "all"
                      ? "bg-white text-[#182319] shadow-xs"
                      : "text-[#5B6A5A] hover:text-[#182319]"
                  }`}
                >
                  Todos ({stats.totalGifts})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("available")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filter === "available"
                      ? "bg-white text-[#182319] shadow-xs"
                      : "text-[#5B6A5A] hover:text-[#182319]"
                  }`}
                >
                  Disponíveis ({stats.availableGifts})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("reserved")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    filter === "reserved"
                      ? "bg-white text-[#182319] shadow-xs"
                      : "text-[#5B6A5A] hover:text-[#182319]"
                  }`}
                >
                  Reservados ({stats.reservedGifts})
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={handleOpenAddModal}
              >
                <Plus className="h-4 w-4" />
                <span>Novo Presente</span>
              </Button>
            </div>

            {/* Gifts Grid or Empty State */}
            {filteredGifts.length === 0 ? (
              <Card className="border-dashed border-[#D8D0C3] bg-white/70 p-10 text-center mb-10">
                <CardContent className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF0E9] text-[#384C37] mx-auto">
                    <GiftIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#182319]">
                    {filter === "all"
                      ? "Sua lista ainda não tem presentes"
                      : filter === "available"
                      ? "Nenhum presente disponível no momento"
                      : "Nenhum presente reservado ainda"}
                  </h3>
                  <p className="text-xs text-[#5B6A5A] max-w-sm mx-auto">
                    {filter === "all"
                      ? "Clique no botão abaixo para adicionar eletrodomésticos, cotas de viagem ou qualquer item que desejar."
                      : "Alterne o filtro ou adicione novos itens para visualizar os presentes."}
                  </p>
                  {filter === "all" && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-1.5 mt-2"
                      onClick={handleOpenAddModal}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Primeiro Presente</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
                {filteredGifts.map((gift) => (
                  <GiftCard
                    key={gift.id}
                    gift={gift}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteGift}
                  />
                ))}
              </div>
            )}

            {/* Reservations Table */}
            <div className="mt-12">
              <ReservationsTable gifts={gifts} />
            </div>
          </>
        )}
      </main>

      {/* Gift Modal (Add / Edit) */}
      <GiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveGift}
        initialData={selectedGift}
        isLoading={modalLoading}
      />
    </div>
  );
}
