"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Users, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!name.trim() || !email.trim() || !password) {
      setFormError("Por favor, preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.push("/dashboard");
    } catch {
      // Handled by store error
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F5] px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2.5 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500 border border-red-100/80 transition-colors group-hover:bg-red-100/80 shadow-xs">
          <Heart className="h-6 w-6 fill-red-500 text-red-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-[#182319]">
            Amor em Lista
          </span>
          <span className="text-[10px] font-semibold text-[#465F45] uppercase tracking-wider">
            100% Gratuito
          </span>
        </div>
      </Link>

      <Card className="w-full max-w-md border-[#E8E2D8] shadow-md bg-white">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-[#182319]">
            Crie a Lista do Casal
          </CardTitle>
          <CardDescription className="text-[#5B6A5A]">
            Presentes de qualquer loja ou em dinheiro via Pix, 100% grátis
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {(formError || error) && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome dos Noivos"
              type="text"
              placeholder="Ex: Clara & Eduardo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<Users className="h-4 w-4" />}
              helperText="Como vocês gostariam de ser chamados na lista"
              required
            />

            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="casal@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              required
            />

            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Pelo menos 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#637362] hover:text-[#182319] cursor-pointer focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              required
            />

            <Input
              label="Confirmar Senha"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Criar Conta Gratuita
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[#5B6A5A]">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#384C37] hover:underline transition-colors"
            >
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-[#6B776E]">
        <Link href="/" className="hover:underline">
          ← Voltar para a página inicial
        </Link>
      </p>
    </div>
  );
}
