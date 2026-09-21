import Link from "next/link";
import {
  Sparkles,
  ShoppingBag,
  QrCode,
  ShieldCheck,
  MailCheck,
  CheckCircle2,
  XCircle,
  Gift,
  ArrowRight,
  HeartHandshake,
  HelpCircle,
  ExternalLink,
  Coins,
  Heart,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#222B23]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-[#E8E2D8] bg-gradient-to-b from-[#FAF8F5] via-[#F4EFEA] to-[#FAF8F5] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[#E5EFE4]/60 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 -left-20 -z-10 h-72 w-72 rounded-full bg-[#EDE5D8]/50 blur-3xl" />

          <div className="mx-auto max-w-4xl text-center">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D5DFD3] bg-[#EAF0E9] px-4 py-1.5 text-xs font-semibold text-[#2D3E2C] shadow-xs mb-8">
              <Sparkles className="h-3.5 w-3.5 text-[#384C37]" />
              <span>100% Gratuito • Presentes em qualquer loja ou dinheiro via Pix</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#182319] sm:text-6xl sm:leading-tight">
              A lista de casamento feita para vocês.{" "}
              <span className="text-[#384C37]">
                Total liberdade para o casal e para os convidados.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#475746] sm:text-xl leading-relaxed">
              Adicione qualquer produto de qualquer loja física ou online, ou receba o valor
              em dinheiro direto na sua conta bancária via Pix. Zero taxas, sem intermediários
              e sem ficar preso a créditos em lojas parceiras.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 text-base px-8 py-3.5 shadow-md shadow-[#384C37]/20">
                  Criar Minha Lista Grátis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#como-funciona" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-base px-6 py-3.5">
                  Ver Como Funciona
                </Button>
              </Link>
            </div>

            {/* Highlights Under Hero */}
            <div className="mt-16 grid grid-cols-1 gap-4 pt-10 border-t border-[#E8E2D8] sm:grid-cols-3 text-left">
              {/* Highlight 1: Buy in any store */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/90 p-4 border border-[#E8E2D8] shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#182319]">Compre Onde Quiser</h4>
                  <p className="text-xs text-[#5B6A5A]">Link para qualquer loja física ou online</p>
                </div>
              </div>

              {/* Highlight 2: Pix direct */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/90 p-4 border border-[#E8E2D8] shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#182319]">Pix Direto na Conta</h4>
                  <p className="text-xs text-[#5B6A5A]">QR Code instantâneo com 0% de taxas</p>
                </div>
              </div>

              {/* Highlight 3: Zero duplicates */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/90 p-4 border border-[#E8E2D8] shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF0E9] text-[#384C37]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#182319]">Zero Duplicidade</h4>
                  <p className="text-xs text-[#5B6A5A]">Reserva de presentes em tempo real</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FREEDOM OF CHOICE SECTION (Store vs Pix) */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-[#EAF0E9] px-3.5 py-1 text-xs font-bold tracking-wider text-[#384C37] uppercase">
              Duas Formas de Presentear
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#182319] sm:text-4xl">
              Seus convidados escolhem como preferem presentear
            </h2>
            <p className="mt-4 text-base text-[#475746]">
              Cada convidado tem seu próprio estilo. No Wedding List, você oferece as duas opções
              no mesmo lugar, com total transparência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Option 1: Buy the actual item */}
            <Card className="border-[#E8E2D8] bg-white shadow-xs p-2">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF0E9] text-[#384C37] mb-6">
                  <ExternalLink className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#182319] mb-3">
                  1. Comprar o presente na loja
                </h3>
                <p className="text-sm text-[#5B6A5A] leading-relaxed mb-6">
                  Você cadastra os itens que deseja (eletrodomésticos, decoração, móveis) e adiciona o link de qualquer loja onde o produto é vendido. O convidado:
                </p>
                <ul className="space-y-3.5 text-sm text-[#334232]">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span>Acessa o link da loja indicada ou compra em qualquer outra loja onde achar melhor preço</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span>Marca o presente como reservado na lista para evitar que outros convidados comprem repetido</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span>Entrega o presente diretamente no endereço indicado pelos noivos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Option 2: Pix directly to couple */}
            <Card className="border-[#E8E2D8] bg-white shadow-xs p-2">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF0E9] text-[#384C37] mb-6">
                  <Coins className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#182319] mb-3">
                  2. Presentear em dinheiro via Pix
                </h3>
                <p className="text-sm text-[#5B6A5A] leading-relaxed mb-6">
                  Para convidados que preferem comodidade, ou para cotas especiais como lua de mel, passeios e jantares românticos:
                </p>
                <ul className="space-y-3.5 text-sm text-[#334232]">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span>O convidado escaneia o QR Code Pix oficial (Bacen) ou usa o código Copia e Cola</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span>O dinheiro cai instantaneamente e 100% integral na conta bancária do casal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span>Zero desconto de taxas ou comissões retidas pela plataforma</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* COMPARISON SECTION (Why Wedding List?) */}
        <section id="vantagens" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#F4EFEA] border-y border-[#E8E2D8]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-[#FAF8F5] border border-[#E8E2D8] px-3.5 py-1 text-xs font-bold tracking-wider text-[#384C37] uppercase">
              Economia e Liberdade
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#182319] sm:text-4xl">
              Por que não usar as plataformas convencionais?
            </h2>
            <p className="mt-4 text-base text-[#475746]">
              A maioria dos sites de casamento retém de 4% a 10% dos seus presentes ou obriga a gastar
              em lojas específicas com preços inflacionados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Platforms */}
            <Card className="border-[#EADFD5] bg-[#FAF6F2] shadow-xs">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 text-[#222B23] font-semibold mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl text-[#182319]">Sites Tradicionais</h3>
                </div>

                <ul className="space-y-4 text-sm text-[#5B6A5A]">
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span>Cobram de <strong>4% a 10% de taxa</strong> sobre cada presente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span>Obrigação de gastar em lojas parceiras com catálogo restrito</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span>Prazos longos (15 a 30 dias) para liberação do dinheiro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span>O convidado não tem a opção de comprar na loja de sua preferência</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Wedding List */}
            <Card className="border-[#D8D0C3] bg-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#384C37] text-white text-[11px] font-bold px-3.5 py-1 rounded-bl-xl tracking-wide">
                100% LIVRE
              </div>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 text-[#182319] font-bold mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF0E9] text-[#384C37]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl">Wedding List</h3>
                </div>

                <ul className="space-y-4 text-sm text-[#222B23]">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span><strong>0% de taxas</strong>: cada centavo vai integralmente para os noivos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span><strong>Qualquer loja</strong>: insira links da Amazon, Tok&Stok, Magalu ou lojas locais</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span><strong>Pix direto</strong>: o convidado transfere na hora para a sua chave</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#384C37] shrink-0 mt-0.5" />
                    <span>Design limpo, elegante e sem banners ou anúncios inconvenientes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block rounded-full bg-[#EAF0E9] px-3.5 py-1 text-xs font-bold tracking-wider text-[#384C37] uppercase">
                Simplicidade
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#182319] sm:text-4xl">
                Como funciona na prática?
              </h2>
              <p className="mt-4 text-base text-[#475746]">
                Três etapas simples para conectar vocês e seus convidados sem dor de cabeça.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-[#E8E2D8] shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0E9] text-[#384C37] text-xl font-bold mb-5">
                  1
                </div>
                <h3 className="text-lg font-semibold text-[#182319] mb-2">
                  Crie sua conta e defina a chave Pix
                </h3>
                <p className="text-sm text-[#5B6A5A]">
                  Cadastre o casal e informe a chave Pix onde desejam receber as contribuições em dinheiro.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-[#E8E2D8] shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0E9] text-[#384C37] text-xl font-bold mb-5">
                  2
                </div>
                <h3 className="text-lg font-semibold text-[#182319] mb-2">
                  Adicione seus presentes favoritos
                </h3>
                <p className="text-sm text-[#5B6A5A]">
                  Insira fotos, valores e o link da loja onde encontrar o item, ou crie cotas de viagem e cotas livres.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-[#E8E2D8] shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF0E9] text-[#384C37] text-xl font-bold mb-5">
                  3
                </div>
                <h3 className="text-lg font-semibold text-[#182319] mb-2">
                  Compartilhe com seus convidados
                </h3>
                <p className="text-sm text-[#5B6A5A]">
                  Eles acessam pelo celular ou computador, escolhem como presentear e reservam o item sem duplicidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-[#EAF0E9] px-3.5 py-1 text-xs font-bold tracking-wider text-[#384C37] uppercase">
              Tira-Dúvidas
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#182319] sm:text-4xl">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h4 className="flex items-center gap-2.5 text-base font-semibold text-[#182319] mb-2">
                  <HelpCircle className="h-5 w-5 text-[#384C37]" />
                  Os convidados são obrigados a dar dinheiro pelo Pix?
                </h4>
                <p className="text-sm text-[#5B6A5A] pl-7 leading-relaxed">
                  Não! Essa é uma das grandes vantagens do Wedding List. Se o convidado quiser comprar o produto físico na loja (física ou online indicada pelo link), ele pode comprar onde preferir e apenas marcar o presente como reservado na lista. Já se preferir a praticidade de enviar o valor, ele pode fazer o Pix diretamente pelo QR Code da lista.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="flex items-center gap-2.5 text-base font-semibold text-[#182319] mb-2">
                  <HelpCircle className="h-5 w-5 text-[#384C37]" />
                  Posso colocar links de qualquer loja?
                </h4>
                <p className="text-sm text-[#5B6A5A] pl-7 leading-relaxed">
                  Sim! Você pode colocar links da Amazon, Tok&Stok, Mercado Livre, Magazine Luiza ou de qualquer loja física/regional da sua cidade. O sistema não tem restrições nem parcerias fechadas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="flex items-center gap-2.5 text-base font-semibold text-[#182319] mb-2">
                  <HelpCircle className="h-5 w-5 text-[#384C37]" />
                  O Wedding List cobra alguma comissão sobre os presentes?
                </h4>
                <p className="text-sm text-[#5B6A5A] pl-7 leading-relaxed">
                  Nenhuma taxa! É 100% gratuito. Quando um convidado faz um Pix para você, a transferência ocorre diretamente da conta dele para a sua chave Pix cadastrada.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="flex items-center gap-2.5 text-base font-semibold text-[#182319] mb-2">
                  <HelpCircle className="h-5 w-5 text-[#384C37]" />
                  Como é evitada a duplicidade de presentes?
                </h4>
                <p className="text-sm text-[#5B6A5A] pl-7 leading-relaxed">
                  Assim que um convidado confirma a reserva de um presente, nosso sistema atualiza o status em tempo real com bloqueio atômico no banco de dados. Nenhum outro convidado conseguirá reservar o mesmo presente.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="bg-[#384C37] py-16 px-4 sm:px-6 lg:px-8 text-white text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <HeartHandshake className="h-12 w-12 mx-auto text-[#D5DFD3]" />
            <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
              Pronto para criar a lista de presentes perfeita?
            </h2>
            <p className="text-base text-[#D5DFD3] max-w-xl mx-auto leading-relaxed">
              Leva menos de 2 minutos para começar. Crie sua conta gratuita agora e dê liberdade total
              para você e para seus convidados.
            </p>
            <div>
              <Link href="/register">
                <Button
                  variant="white"
                  size="lg"
                  className="font-bold px-9 py-4 text-[#182319] bg-white hover:bg-[#FAF8F5] border-2 border-white shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Criar Minha Lista Agora
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E8E2D8] bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B776E]">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span className="font-semibold text-[#182319]">Wedding List</span>
            <span>— Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[#182319] transition-colors">
              Área dos Noivos
            </Link>
            <Link href="/register" className="hover:text-[#182319] transition-colors">
              Cadastrar
            </Link>
            <Link href="#como-funciona" className="hover:text-[#182319] transition-colors">
              Como Funciona
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
