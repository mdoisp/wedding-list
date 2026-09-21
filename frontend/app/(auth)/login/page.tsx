"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email || !password) {
      setFormError("Por favor, preencha todos os campos.");
      return;
    }

    try {
      await login({ email, password });
      router.push(redirectPath);
    } catch {
      // Error is stored in useAuthStore and handled by the UI
    }
  };

  return (
    <Card className="w-full max-w-md border-stone-200/80 shadow-md">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-stone-900">
          Bem-vindos de volta
        </CardTitle>
        <CardDescription>
          Acesse o painel para gerenciar a sua lista de presentes
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {(formError || error) && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="noivos@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            required
          />

          <Input
            label="Senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer focus:outline-none"
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Entrar no Painel
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          Ainda não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Cadastre-se gratuitamente
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50/50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2.5 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
          <Heart className="h-6 w-6 fill-rose-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-stone-900">
            Wedding List
          </span>
          <span className="text-[10px] font-medium text-rose-600 uppercase tracking-widest">
            100% Gratuito
          </span>
        </div>
      </Link>

      <Suspense fallback={<div className="h-64 flex items-center justify-center text-stone-400">Carregando...</div>}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-xs text-stone-400">
        <Link href="/" className="hover:underline">
          ← Voltar para a página inicial
        </Link>
      </p>
    </div>
  );
}
