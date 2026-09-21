"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Button } from "./ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { couple, isAuthenticated, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
            <Heart className="h-5 w-5 fill-rose-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-stone-900">
              Wedding List
            </span>
            <span className="text-[10px] font-medium text-rose-600 uppercase tracking-widest">
              100% Gratuito
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-8">
          <Link
            href="/#como-funciona"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Como Funciona
          </Link>
          <Link
            href="/#vantagens"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Vantagens
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Dúvidas
          </Link>
        </nav>

        {/* Desktop Auth CTA */}
        <div className="hidden md:flex md:items-center md:gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  {couple?.name ? `Olá, ${couple.name}` : "Meu Painel"}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-stone-500 hover:text-red-600 gap-1.5"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Sair</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Criar Lista Grátis
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-stone-200 bg-white px-4 py-5 shadow-lg md:hidden sm:px-6">
          <nav className="flex flex-col gap-4">
            <Link
              href="/#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-stone-700 hover:text-stone-900"
            >
              Como Funciona
            </Link>
            <Link
              href="/#vantagens"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-stone-700 hover:text-stone-900"
            >
              Vantagens
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-stone-700 hover:text-stone-900"
            >
              Dúvidas
            </Link>
            <div className="my-2 border-t border-stone-100" />
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {couple?.name ? `Olá, ${couple.name}` : "Meu Painel"}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-red-600 hover:bg-red-50 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Criar Lista Grátis
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
