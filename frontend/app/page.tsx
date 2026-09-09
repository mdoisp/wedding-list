import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding List — Lista de Presentes de Casamento",
  description:
    "Crie e gerencie sua lista de presentes de casamento. 100% gratuito, sem intermediários.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">💍 Wedding List</h1>
        <p className="mt-4 text-xl text-gray-600">
          Sua lista de presentes. Sem taxas. Sem intermediários.
        </p>
        <p className="mt-2 text-sm text-gray-400">Em breve...</p>
      </div>
    </main>
  );
}
