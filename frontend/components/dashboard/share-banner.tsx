"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareBannerProps {
  publicToken: string;
  listTitle: string;
}

export function ShareBanner({ publicToken, listTitle }: ShareBannerProps) {
  const [copied, setCopied] = useState(false);

  // In client, construct the full URL
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/list/${publicToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      const input = document.createElement("input");
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="rounded-2xl border border-[#D5DFD3] bg-[#EAF0E9] p-5 sm:p-6 mb-8 text-[#182319]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#384C37] text-white">
              <Share2 className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[#182319]">
              Link Público da sua Lista
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#475746]">
            Compartilhe este link no WhatsApp, convite ou site do casamento para os convidados
            acessarem e reservarem presentes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center rounded-xl bg-white border border-[#D8D0C3] px-3.5 py-2 text-xs text-[#222B23] font-mono select-all overflow-hidden truncate max-w-xs shadow-xs">
            <span className="truncate">{publicUrl || `/list/${publicToken}`}</span>
          </div>

          <Button
            type="button"
            onClick={handleCopy}
            variant={copied ? "secondary" : "primary"}
            size="sm"
            className="gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar Link</span>
              </>
            )}
          </Button>

          <Link href={`/list/${publicToken}`} target="_blank" className="shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5 bg-white/70 hover:bg-white"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Ver Lista</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
