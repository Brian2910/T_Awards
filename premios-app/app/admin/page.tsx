import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminPanel from "./AdminPanel";
import BackLink from "../BackLink";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdmin(session.user.email)) {
    redirect("/");
  }

  const [games, users, transactions, categories] = await Promise.all([
  prisma.game.findMany({ orderBy: { createdAt: "desc" } }),
  prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, points: true },
  }),
  prisma.pointTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { name: true } },
      game: { select: { name: true } },
    },
  }),
  prisma.category.findMany({ orderBy: { createdAt: "desc" } }),
]);

  return (
    <main className="votar-page">
      <BackLink href="/" label="Inicio" />
      <header className="votar-header">
        <h1>Panel del organizador</h1>
        <p>Cargá los juegos de la ceremonia y otorgá puntos a medida que se juegan.</p>
        <a href="/admin/respuestas" className="home-cta">
          Ver respuestas de las categorías →
        </a>
        <a href="/admin/juegos" className="home-cta">
          Ver puntos por juego →
        </a>
      </header>

      <AdminPanel
        initialGames={games}
        initialUsers={users}
        initialTransactions={transactions.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
        }))}
        initialCategories={categories}
      />
    </main>
  );
}
