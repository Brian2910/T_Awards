import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories -> lista todas las categorías, ordenadas
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}

// POST /api/categories -> crea una categoría (uso administrativo)
export async function POST(req: Request) {
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
