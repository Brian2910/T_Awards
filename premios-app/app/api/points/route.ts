import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/points -> registra una transacción de puntos y actualiza el total del usuario.
// Protegido: solo el email definido en ADMIN_EMAIL puede otorgar puntos.
// Body: { userId, points, reason, gameId? }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { userId, points, reason, gameId } = await req.json();

  if (!userId || typeof points !== "number" || !reason) {
    return NextResponse.json(
      { error: "Faltan datos: userId, points (número) y reason son obligatorios." },
      { status: 400 }
    );
  }

  const [transaction] = await prisma.$transaction([
    prisma.pointTransaction.create({
      data: { userId, points, reason, gameId: gameId ?? undefined },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
    }),
  ]);

  return NextResponse.json(transaction);
}

// GET /api/points -> historial de puntos del usuario logueado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const history = await prisma.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { game: { select: { name: true } } },
  });

  return NextResponse.json(history);
}
