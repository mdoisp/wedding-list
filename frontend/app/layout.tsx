import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wedding List — Sua Lista de Casamento 100% Gratuita",
  description:
    "Crie sua lista de presentes de casamento com Pix direto na sua conta bancária. Zero taxas, sem intermediários e sem vínculo com lojas.",
  keywords: [
    "lista de casamento",
    "presentes de casamento",
    "casamento gratuito",
    "pix casamento",
    "lista de presentes",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50/50 text-stone-900 font-sans">
        {children}
      </body>
    </html>
  );
}
