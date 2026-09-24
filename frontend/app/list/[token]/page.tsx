import { Metadata } from "next";
import Link from "next/link";
import { Heart, SearchX, ArrowLeft } from "lucide-react";
import { getPublicList } from "@/lib/api/public";
import { PublicListView } from "@/components/public/public-list-view";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  try {
    const list = await getPublicList(token);
    return {
      title: `${list.title} — ${list.couple_name} | Amor em Lista`,
      description: `Confira a lista de presentes de casamento de ${list.couple_name}. Escolha um presente para os noivos ou faça uma contribuição via Pix!`,
      openGraph: {
        title: `${list.title} — ${list.couple_name}`,
        description: `Lista de presentes de casamento de ${list.couple_name}. Escolha um item ou contribua via Pix!`,
      },
    };
  } catch {
    return {
      title: "Lista de Casamento | Amor em Lista",
      description: "Lista de presentes de casamento 100% gratuita.",
    };
  }
}

export default async function PublicListPage({ params }: PageProps) {
  const { token } = await params;

  try {
    const list = await getPublicList(token);

    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <Navbar />
        <PublicListView initialList={list} />
      </div>
    );
  } catch {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F2ECE3] text-[#8E9B8D] border border-[#E8E2D8] mb-5">
            <SearchX className="h-10 w-10 text-[#5B6A5A]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold mb-3 border border-rose-200">
            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
            <span>Lista não localizada</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#182319] mb-2">
            Lista de Casamento Não Encontrada
          </h1>

          <p className="text-sm text-[#5B6A5A] max-w-md mb-6 leading-relaxed">
            O link que você tentou acessar não existe, expirou ou foi digitado incorretamente.
            Verifique o endereço enviado pelos noivos.
          </p>

          <Link href="/">
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Ir para a Página Inicial</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
