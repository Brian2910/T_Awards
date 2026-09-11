import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { name, description, type, order } = await req.json();

  if (!name || !type) {
    return NextResponse.json(
      { error: "Faltan datos: nombre y tipo son obligatorios." },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: { name, description, type, order: order ?? 0 },
  });

  return NextResponse.json(category);
}