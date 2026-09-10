import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BackLink from "../../BackLink";

export default async function JuegosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdmin(session.user.email)) {
    redirect("/");
  }

  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      transactions: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  return (
    <main className="votar-page">
      <BackLink href="/admin" label="Panel admin" />
      <header className="votar-header">
        <h1>Puntos por juego</h1>
        <p>Todos los puntos otorgados, agrupados por juego.</p>
      </header>

      <div className="respuestas-list">
        {games.map((g) => (
          <section key={g.id} className="respuestas-category">
            <div className="respuestas-category-header">
              <h2>{g.name}</h2>
              <span className="respuestas-count">
                {g.transactions.length}{" "}
                {g.transactions.length === 1 ? "movimiento" : "movimientos"}
              </span>
            </div>

            {g.transactions.length === 0 ? (
              <p className="respuestas-empty">Todavía no se otorgaron puntos en este juego.</p>
            ) : (
              <ul className="respuestas-answers">
                {g.transactions.map((t) => (
                  <li key={t.id}>
                    <strong>{t.user.name}:</strong> {t.points >= 0 ? "+" : ""}
                    {t.points} — {t.reason}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}