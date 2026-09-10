import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VoteCard from "./VoteCard";
import BackLink from "../BackLink";

export default async function VotarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  const [categories, votes] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.vote.findMany({ where: { userId }, select: { categoryId: true } }),
  ]);

  const votedIds = new Set(votes.map((v) => v.categoryId));

  return (
    <main className="votar-page">
      <BackLink href="/" label="Inicio" />
      <header className="votar-header">
        <h1>Votá las categorías</h1>
        <p>Hola {session.user.name}, elegí tu respuesta en cada categoría.</p>
      </header>

      {categories.length === 0 ? (
        <p>Todavía no hay categorías cargadas.</p>
      ) : (
        <div className="votar-grid">
          {categories.map((c) => (
            <VoteCard
              key={c.id}
              categoryId={c.id}
              name={c.name}
              description={c.description}
              type={c.type}
              alreadyVoted={votedIds.has(c.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
