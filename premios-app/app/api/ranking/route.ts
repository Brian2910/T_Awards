import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const top = await prisma.user.findMany({
    orderBy: { points: "desc" },
    take: 10,
    select: { id: true, name: true, image: true, points: true },
  });

  return NextResponse.json(top);
}
