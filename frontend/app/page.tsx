import Link from "next/link";
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  MailCheck,
  CheckCircle2,
  XCircle,
  Gift,
  ArrowRight,
  HeartHandshake,
  HelpCircle,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-stone-200/60 bg-gradient-to-b from-rose-50/50 via-white to-stone-50/30 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          {/* Subtle background glow circles */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 -left-20 -z-10 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl" />

          <div className="mx-auto max-w-4xl text-center">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold text-rose-700 shadow-xs mb-8">
              <Sparkles className="h-3.5 w-3.5 text-rose-600" />
              <span>100% Gratuito • Zero taxas nos presentes • Pix Direto</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-6xl sm:leading-none">
              O seu casamento merece presentes de verdade,{" "}
              <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                sem nenhuma taxa.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 sm:text-xl">
              Crie sua lista de presentes personalizada em minutos. Seus convidados
              presenteiam você com Pix direto para a sua conta bancária, sem intermediários
              e sem surpresas.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 text-base px-8 py-3.5 shadow-lg shadow-rose-600/20">
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
            <div className="mt-16 grid grid-cols-1 gap-4 pt-10 border-t border-stone-200/60 sm:grid-cols-3 text-left">
              <div className="flex items-center gap-3.5 rounded-xl bg-white/70 p-3.5 border border-stone-200/60 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">Pix Instantâneo</h4>
                  <p className="text-xs text-stone-500">QR Code BR Code oficial do Bacen</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl bg-white/70 p-3.5 border border-stone-200/60 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">Zero Duplicidade</h4>
                  <p className="text-xs text-stone-500">Reserva atômica de presentes</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl bg-white/70 p-3.5 border border-stone-200/60 shadow-xs">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <MailCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900">Avisos por E-mail</h4>
                  <p className="text-xs text-stone-500">Notificação rápida aos noivos e convidados</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION (Why Wedding List?) */}
        <section id="vantagens" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">
              Economia Real
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Por que os casais preferem o Wedding List?
            </h2>
            <p className="mt-4 text-base text-stone-600">
              A maioria dos sites de casamento cobra entre 4% a 10% do total arrecadado
              pelos noivos. Nós acreditamos que cada centavo do presente pertence a você.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Traditional Platforms */}
            <Card className="border-red-200 bg-red-50/20 shadow-xs">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 text-stone-700 font-semibold mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl">Outras Plataformas</h3>
                </div>

                <ul className="space-y-4 text-sm text-stone-600">
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span>Cobram de <strong>4% a 10% de taxa</strong> sobre cada presente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span>Prazos de 15 a 30 dias para liberação do dinheiro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span>Obrigação de gastar em créditos em lojas com preços inflacionados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span>Taxas ocultas de transferência para conta corrente</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Wedding List */}
            <Card className="border-rose-300 bg-gradient-to-br from-white to-rose-50/40 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-lg">
                RECOMENDADO
              </div>
              <CardContent className="p-8">
                <div className="flex items-center gap-3 text-stone-900 font-bold mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl">Wedding List</h3>
                </div>

                <ul className="space-y-4 text-sm text-stone-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>0% de taxa</strong>: 100% do presente cai direto na sua conta</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Pix direto</strong>: dinheiro disponível no mesmo segundo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Liberdade total</strong>: use como quiser (viagem, casa ou poupança)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span>Link público elegante e sem anúncios inconvenientes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="como-funciona" className="py-20 bg-stone-100/70 border-y border-stone-200/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">
                Simplicidade
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Como funciona o Wedding List?
              </h2>
              <p className="mt-4 text-base text-stone-600">
                Tudo foi pensado para que a experiência dos noivos e dos convidados seja
                ágil, elegante e sem complicações.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 text-xl font-bold mb-5">
                  1
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  Crie sua conta e configure o Pix
                </h3>
                <p className="text-sm text-stone-600">
                  Cadastre o casal e informe sua chave Pix (CPF, e-mail, celular ou chave aleatória).
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 text-xl font-bold mb-5">
                  2
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  Personalize sua Lista de Presentes
                </h3>
                <p className="text-sm text-stone-600">
                  Adicione presentes reais com foto e link de compra, ou cotas simbólicas como lua de mel e passeios.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 text-xl font-bold mb-5">
                  3
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  Compartilhe seu Link Único
                </h3>
                <p className="text-sm text-stone-600">
                  Envie para amigos e familiares. O convidado reserva o presente e realiza o Pix diretamente para você.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-rose-600 uppercase">
              Tira-Dúvidas
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h4 className="flex items-center gap-2.5 text-base font-semibold text-stone-900 mb-2">
                  <HelpCircle className="h-5 w-5 text-rose-600" />
                  O Wedding List é realmente 100% gratuito?
                </h4>
                <p className="text-sm text-stone-600 pl-7">
                  Sim! Não cobramos taxas de cadastro, mensalidades e nenhuma porcentagem sobre os presentes. Os convidados fazem Pix diretamente para a sua conta.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="flex items-center gap-2.5 text-base font-semibold text-stone-900 mb-2">
                  <HelpCircle className="h-5 w-5 text-rose-600" />
                  Como os convidados realizam o pagamento?
                </h4>
                <p className="text-sm text-stone-600 pl-7">
                  Na página do presente, é gerado um QR Code oficial Pix (BR Code) e o código Pix Copia e Cola com a chave do casal, facilitando o pagamento em qualquer aplicativo bancário.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="flex items-center gap-2.5 text-base font-semibold text-stone-900 mb-2">
                  <HelpCircle className="h-5 w-5 text-rose-600" />
                  Existe risco de dois convidados escolherem o mesmo presente?
                </h4>
                <p className="text-sm text-stone-600 pl-7">
                  Não. Nosso sistema conta com reserva atômica de presentes. Assim que um convidado reserva um item, ele é imediatamente bloqueado para novos acessos.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="bg-gradient-to-r from-rose-600 to-rose-700 py-16 px-4 sm:px-6 lg:px-8 text-white text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <HeartHandshake className="h-12 w-12 mx-auto text-rose-200" />
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Pronto para criar a lista de presentes perfeita?
            </h2>
            <p className="text-base text-rose-100 max-w-xl mx-auto">
              Leva menos de 2 minutos para começar. Crie sua conta gratuita agora mesmo e aproveite 100% dos seus presentes.
            </p>
            <div>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-rose-700 hover:bg-stone-50 hover:text-rose-800 shadow-xl font-bold px-8 py-3.5"
                >
                  Criar Minha Lista Agora
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-rose-600" />
            <span className="font-semibold text-stone-700">Wedding List</span>
            <span>— Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-stone-900 transition-colors">
              Área dos Noivos
            </Link>
            <Link href="/register" className="hover:text-stone-900 transition-colors">
              Cadastrar
            </Link>
            <Link href="#como-funciona" className="hover:text-stone-900 transition-colors">
              Como Funciona
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
