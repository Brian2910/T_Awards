import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const [user, top] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, points: true },
    }),
    prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 10,
      select: { id: true, name: true, points: true },
    }),
  ]);

  if (!user) redirect("/login");

  const rank =
    (await prisma.user.count({ where: { points: { gt: user.points } } })) + 1;

  return (
    <main className="perfil-page">
      <header className="votar-header">
        <h1>Mi perfil</h1>
        <p>{user.email}</p>
      </header>

      <div className="perfil-layout">
        <ProfileForm initialName={user.name} initialImage={user.image} />

        <div className="points-card">
          <p className="points-total">{user.points} puntos</p>
          <p className="points-rank">Puesto #{rank}</p>

          <h2 className="ranking-title">Ranking</h2>
          <ol className="ranking-list">
            {top.map((u) => (
              <li key={u.id} className={u.name === user.name ? "ranking-me" : ""}>
                <span>{u.name}</span>
                <span>{u.points} pts</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
