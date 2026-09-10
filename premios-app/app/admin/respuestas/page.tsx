import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BackLink from "../../BackLink";

export default async function RespuestasPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  if (!isAdmin(session.user.email)) {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      votes: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  const typeLabel = { TEXT: "Texto", TEXT3: "Texto", PHOTO: "Foto", AUDIO: "Audio" } as const;

  return (
    <main className="votar-page">
      <BackLink href="/admin" label="Panel admin" />
      <header className="votar-header">
        <h1>Respuestas por categoría</h1>
        <p>Todo lo que fueron votando los participantes, agrupado por categoría.</p>
      </header>

      <div className="respuestas-list">
        {categories.map((c) => (
          <section key={c.id} className="respuestas-category">
            <div className="respuestas-category-header">
              <span className="vote-card-type">{typeLabel[c.type]}</span>
              <h2>{c.name}</h2>
              <span className="respuestas-count">
                {c.votes.length} {c.votes.length === 1 ? "respuesta" : "respuestas"}
              </span>
            </div>

            {c.votes.length === 0 ? (
              <p className="respuestas-empty">Todavía nadie votó acá.</p>
            ) : (
              <ul className="respuestas-answers">
                {c.votes.map((v) => (
                  <li key={v.id}>
                    <strong>{v.user.name}:</strong>{" "}
                    {c.type === "TEXT" ? (
                      <span>{v.textAnswer}</span>
                    ) : c.type === "TEXT3" ? (
                      <ul className="respuestas-multi">
                        <li>{v.textAnswer}</li>
                        <li>{v.textAnswer2}</li>
                        <li>{v.textAnswer3}</li>
                      </ul>
                    ) : c.type === "PHOTO" ? (
                      <a href={v.fileUrl ?? "#"} target="_blank" rel="noreferrer">
                        Ver foto
                      </a>
                    ) : (
                      <a href={v.fileUrl ?? "#"} target="_blank" rel="noreferrer">
                        Escuchar audio
                      </a>
                    )}
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