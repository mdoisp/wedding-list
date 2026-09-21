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
    <header className="sticky top-0 z-50 border-b border-[#E8E2D8] bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100/80 transition-colors group-hover:bg-red-100/80 shadow-xs">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-[#1A231B]">
              Wedding List
            </span>
            <span className="text-[10px] font-semibold text-[#465F45] uppercase tracking-wider">
              100% Gratuito
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-8">
          <Link
            href="/#como-funciona"
            className="text-sm font-medium text-[#465F45] transition-colors hover:text-[#1A231B]"
          >
            Como Funciona
          </Link>
          <Link
            href="/#vantagens"
            className="text-sm font-medium text-[#465F45] transition-colors hover:text-[#1A231B]"
          >
            Vantagens
          </Link>
          <Link
            href="/#faq"
            className="text-sm font-medium text-[#465F45] transition-colors hover:text-[#1A231B]"
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
                className="text-[#5B6A5A] hover:text-rose-700 gap-1.5"
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
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#384C37] hover:bg-[#EAF0E9]"
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
        <div className="border-b border-[#E8E2D8] bg-[#FAF8F5] px-4 py-5 shadow-lg md:hidden sm:px-6">
          <nav className="flex flex-col gap-4">
            <Link
              href="/#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#222B23] hover:text-[#384C37]"
            >
              Como Funciona
            </Link>
            <Link
              href="/#vantagens"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#222B23] hover:text-[#384C37]"
            >
              Vantagens
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#222B23] hover:text-[#384C37]"
            >
              Dúvidas
            </Link>
            <div className="my-2 border-t border-[#E8E2D8]" />
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
                  className="w-full justify-start text-rose-700 hover:bg-rose-50 gap-2"
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
