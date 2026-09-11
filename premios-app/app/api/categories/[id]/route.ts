import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { name, description, type } = await req.json();

  if (!name || !type) {
    return NextResponse.json(
      { error: "Faltan datos: nombre y tipo son obligatorios." },
      { status: 400 }
    );
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: { name, description, type },
  });

  return NextResponse.json(category);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "true";

  const voteCount = await prisma.vote.count({ where: { categoryId: params.id } });

  if (voteCount > 0 && !force) {
    return NextResponse.json(
      { error: `Esta categoría ya tiene ${voteCount} voto(s) cargado(s).`, voteCount },
      { status: 409 }
    );
  }

  if (voteCount > 0) {
    await prisma.vote.deleteMany({ where: { categoryId: params.id } });
  }

  await prisma.category.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}