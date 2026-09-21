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
    <div className="min-h-screen bg-stone-50/50 flex flex-col">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Heart className="h-5 w-5 fill-rose-600" />
            </div>
            <span className="text-lg font-bold tracking-tight text-stone-900">
              Wedding List
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-stone-700 hidden sm:inline">
              {couple?.name ? `Noivos: ${couple.name}` : "Carregando..."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-stone-600 hover:text-red-600 gap-1.5"
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
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 p-6 sm:p-8 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Painel dos Noivos
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {couple?.name ? `Parabéns, ${couple.name}!` : "Bem-vindos!"}
              </h1>
              <p className="mt-2 text-rose-100 text-sm sm:text-base max-w-xl">
                Sua conta está ativa e pronta. Em breve você poderá adicionar seus presentes, configurar o Pix e acompanhar as reservas dos convidados.
              </p>
            </div>
            <div className="shrink-0">
              <Link href="/">
                <Button className="bg-white text-rose-700 hover:bg-stone-100 font-semibold shadow-sm">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Presentes Cadastrados
                </p>
                <h3 className="text-2xl font-bold text-stone-900 mt-0.5">0</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Presentes Reservados
                </p>
                <h3 className="text-2xl font-bold text-stone-900 mt-0.5">0</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Total Arrecadado
                </p>
                <h3 className="text-2xl font-bold text-stone-900 mt-0.5">R$ 0,00</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Sub-Task Banner */}
        <Card className="border-dashed border-stone-300 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Passos (Sub-Tarefa 9)</CardTitle>
            <CardDescription>
              O gerenciador completo da lista de presentes, cadastro com fotos e links, chave Pix e acompanhamento de reservas estará disponível na próxima etapa de desenvolvimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <ExternalLink className="h-4 w-4 text-stone-400" />
              <span>Autenticação e proteção de rotas ativas com sucesso.</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
