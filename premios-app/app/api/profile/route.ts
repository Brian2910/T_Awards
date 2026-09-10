import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, points: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuario inexistente." }, { status: 404 });
  }

  // Ranking: cuántos usuarios tienen más puntos que este
  const ahead = await prisma.user.count({
    where: { points: { gt: user.points } },
  });

  return NextResponse.json({ ...user, rank: ahead + 1 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const { name } = await req.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "El nombre no puede estar vacío." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true, image: true, points: true },
  });

  return NextResponse.json(user);
}
