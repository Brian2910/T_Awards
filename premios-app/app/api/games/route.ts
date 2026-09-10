import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const games = await prisma.game.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(games);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { name, description } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Falta el nombre del juego." }, { status: 400 });
  }

  const game = await prisma.game.create({ data: { name, description } });
  return NextResponse.json(game);
}
