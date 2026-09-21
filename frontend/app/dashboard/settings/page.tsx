"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ArrowLeft,
  QrCode,
  Bell,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { updateMe } from "@/lib/api/auth";
import { getLists, updateList, GiftListResponse } from "@/lib/api/list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();
  const { couple, checkAuth } = useAuthStore();

  const [name, setName] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("CPF");
  const [emailNotifications, setEmailNotifications] = useState(true);

  // List Settings
  const [currentList, setCurrentList] = useState<GiftListResponse | null>(null);
  const [listTitle, setListTitle] = useState("");
  const [weddingDate, setWeddingDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (couple) {
      setName(couple.name || "");
      setPixKey(couple.pix_key || "");
      setPixKeyType(couple.pix_key_type || "CPF");
      setEmailNotifications(couple.email_notifications_enabled ?? true);
    }
  }, [couple]);

  useEffect(() => {
    async function loadList() {
      try {
        const lists = await getLists();
        if (lists && lists.length > 0) {
          const list = lists[0];
          setCurrentList(list);
          setListTitle(list.title || "");
          setWeddingDate(list.wedding_date || "");
        }
      } catch (err) {
        console.error("Erro ao carregar lista:", err);
      }
    }
    loadList();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // 1. Update couple settings
      await updateMe({
        name: name.trim(),
        pix_key: pixKey.trim() || null,
        pix_key_type: pixKeyType || null,
        email_notifications_enabled: emailNotifications,
      });

      // 2. Update list title/date if list exists
      if (currentList) {
        await updateList(currentList.id, {
          title: listTitle.trim() || currentList.title,
          wedding_date: weddingDate || null,
        });
      }

      await checkAuth();
      setSuccessMessage("Configurações salvas com sucesso!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Erro ao salvar configurações"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#222B23]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#E8E2D8] bg-[#FAF8F5]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#384C37] hover:text-[#182319] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Painel</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#182319]">
              Amor em Lista
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#182319] tracking-tight">
            Configurações da Conta e Lista
          </h1>
          <p className="text-sm text-[#5B6A5A] mt-1">
            Configure sua chave Pix para receber presentes em dinheiro e personalize os detalhes do casamento.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-xs">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Card: Dados do Casal */}
          <Card className="border-[#E8E2D8] bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-[#E8E2D8]">
              <CardTitle className="text-base font-bold text-[#182319] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#384C37]" />
                Identificação do Casal
              </CardTitle>
              <CardDescription className="text-xs text-[#5B6A5A]">
                Como o casal é apresentado aos convidados
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <Input
                label="Nome do Casal *"
                placeholder="Ex: Beatriz & Lucas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="text-left space-y-1.5">
                <label className="block text-sm font-medium text-[#222B23]">
                  E-mail da Conta
                </label>
                <input
                  type="email"
                  disabled
                  value={couple?.email || ""}
                  className="block w-full rounded-xl border border-[#D8D0C3] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#5B6A5A] cursor-not-allowed"
                />
                <p className="text-xs text-[#8E9B8D]">
                  O e-mail é utilizado para login e recebimento de avisos de reservas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card: Configuração Pix */}
          <Card className="border-[#E8E2D8] bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-[#E8E2D8]">
              <CardTitle className="text-base font-bold text-[#182319] flex items-center gap-2">
                <QrCode className="h-4 w-4 text-[#384C37]" />
                Chave Pix para Recebimento
              </CardTitle>
              <CardDescription className="text-xs text-[#5B6A5A]">
                Essencial para que os convidados possam transferir presentes em dinheiro com 0% de taxas
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-left space-y-1.5">
                  <label className="block text-sm font-medium text-[#222B23]">
                    Tipo de Chave
                  </label>
                  <select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value)}
                    className="block w-full rounded-xl border border-[#D8D0C3] bg-white px-3.5 py-2.5 text-sm text-[#1A231B] focus:border-[#384C37] focus:outline-none focus:ring-2 focus:ring-[#EAF0E9]"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="PHONE">Telefone</option>
                    <option value="RANDOM">Chave Aleatória</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Chave Pix"
                    placeholder="Informe sua chave Pix"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    helperText="O QR Code oficial Pix gerado na lista usará exatamente esta chave."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Detalhes da Lista */}
          {currentList && (
            <Card className="border-[#E8E2D8] bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-[#E8E2D8]">
                <CardTitle className="text-base font-bold text-[#182319] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#384C37]" />
                  Informações do Casamento
                </CardTitle>
                <CardDescription className="text-xs text-[#5B6A5A]">
                  Título exibido na lista pública e data da celebração
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <Input
                  label="Título da Lista"
                  placeholder="Ex: Lista de Casamento de Beatriz & Lucas"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                />

                <Input
                  label="Data do Casamento"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  helperText="Exibida no topo da página de presentes para os convidados."
                />
              </CardContent>
            </Card>
          )}

          {/* Card: Notificações */}
          <Card className="border-[#E8E2D8] bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-[#E8E2D8]">
              <CardTitle className="text-base font-bold text-[#182319] flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#384C37]" />
                Notificações por E-mail
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#D8D0C3] text-[#384C37] focus:ring-[#384C37]"
                />
                <div>
                  <span className="text-sm font-medium text-[#182319]">
                    Receber aviso por e-mail a cada presente reservado
                  </span>
                  <p className="text-xs text-[#5B6A5A]">
                    Enviaremos um e-mail com o nome do convidado e o presente escolhido sempre que houver uma reserva.
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="gap-2 px-8"
              isLoading={isLoading}
            >
              <Save className="h-4 w-4" />
              <span>Salvar Configurações</span>
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
