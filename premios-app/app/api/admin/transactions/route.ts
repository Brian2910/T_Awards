import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const transactions = await prisma.pointTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { name: true } },
      game: { select: { name: true } },
    },
  });

  return NextResponse.json(transactions);
}
