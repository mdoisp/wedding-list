"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Gift,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { couple, isAuthenticated, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#222B23]">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#E8E2D8] bg-[#FAF8F5]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
              <Heart className="h-5 w-5 fill-[#384C37]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#182319]">
              Wedding List
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#465F45] hidden sm:inline">
              {couple?.name ? `Noivos: ${couple.name}` : "Carregando..."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-[#465F45] hover:text-rose-700 gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl bg-[#384C37] p-6 sm:p-8 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-3 text-[#EAF0E9]">
                <Sparkles className="h-3.5 w-3.5" />
                Painel dos Noivos
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {couple?.name ? `Parabéns, ${couple.name}!` : "Bem-vindos!"}
              </h1>
              <p className="mt-2 text-[#EAF0E9] text-sm sm:text-base max-w-xl">
                Sua conta está ativa e pronta. Em breve você poderá adicionar seus presentes, configurar o Pix e acompanhar as reservas dos convidados.
              </p>
            </div>
            <div className="shrink-0">
              <Link href="/">
                <Button className="bg-white text-[#2D3E2C] hover:bg-[#FAF8F5] font-semibold shadow-xs">
                  Ver Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats (Prepared for Sub-Task 9) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#5B6A5A] uppercase tracking-wider">
                  Presentes Cadastrados
                </p>
                <h3 className="text-2xl font-bold text-[#182319] mt-0.5">0</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#5B6A5A] uppercase tracking-wider">
                  Presentes Reservados
                </p>
                <h3 className="text-2xl font-bold text-[#182319] mt-0.5">0</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#5B6A5A] uppercase tracking-wider">
                  Total Arrecadado
                </p>
                <h3 className="text-2xl font-bold text-[#182319] mt-0.5">R$ 0,00</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Sub-Task Banner */}
        <Card className="border-dashed border-[#D8D0C3] bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-[#182319]">Próximos Passos (Sub-Tarefa 9)</CardTitle>
            <CardDescription className="text-[#5B6A5A]">
              O gerenciador completo da lista de presentes, cadastro com fotos e links de qualquer loja, chave Pix e acompanhamento de reservas estará disponível na próxima etapa de desenvolvimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex items-center gap-2 text-sm text-[#465F45]">
              <ExternalLink className="h-4 w-4 text-[#384C37]" />
              <span>Autenticação, layout e identidade visual atualizados com sucesso.</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
