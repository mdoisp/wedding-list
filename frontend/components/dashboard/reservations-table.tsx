"use client";

import { GiftResponse } from "@/lib/api/list";
import { UserCheck, Calendar, DollarSign, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ReservationsTableProps {
  gifts: GiftResponse[];
}

export function ReservationsTable({ gifts }: ReservationsTableProps) {
  const reservedGifts = gifts.filter((g) => g.is_reserved && g.reservation);

  if (reservedGifts.length === 0) {
    return (
      <Card className="border-[#E8E2D8] bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-[#182319]">Histórico de Reservas</CardTitle>
          <CardDescription className="text-[#5B6A5A]">
            Acompanhe quem reservou cada presente e envie agradecimentos
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-[#5B6A5A]">
          <p className="text-sm">Nenhum presente foi reservado ainda.</p>
          <p className="text-xs text-[#8E9B8D] mt-1">
            Assim que seus convidados escolherem um presente, os detalhes aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E8E2D8] bg-white overflow-hidden shadow-xs">
      <CardHeader className="pb-3 border-b border-[#E8E2D8]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-[#182319] flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-700" />
              Histórico de Reservas
            </CardTitle>
            <CardDescription className="text-[#5B6A5A]">
              Total de {reservedGifts.length} presente{reservedGifts.length > 1 ? "s" : ""} reservado{reservedGifts.length > 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#222B23]">
          <thead className="bg-[#FAF8F5] text-xs font-semibold uppercase text-[#5B6A5A] border-b border-[#E8E2D8]">
            <tr>
              <th className="px-6 py-3.5">Presente</th>
              <th className="px-6 py-3.5">Convidado</th>
              <th className="px-6 py-3.5">E-mail</th>
              <th className="px-6 py-3.5">Data</th>
              <th className="px-6 py-3.5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E2D8]">
            {reservedGifts.map((gift) => {
              const res = gift.reservation!;
              const dateStr = new Date(res.reserved_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              const priceStr =
                gift.price !== null && gift.price !== undefined
                  ? Number(gift.price).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "—";

              return (
                <tr key={gift.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#182319]">
                    {gift.name}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {res.guest_name}
                  </td>
                  <td className="px-6 py-4 text-[#5B6A5A]">
                    <span className="inline-flex items-center gap-1 font-mono text-xs">
                      <Mail className="h-3 w-3 text-[#8E9B8D]" />
                      {res.guest_email}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#5B6A5A] text-xs">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#8E9B8D]" />
                      {dateStr}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#384C37]">
                    {priceStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
