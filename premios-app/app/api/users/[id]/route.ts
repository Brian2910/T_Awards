import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  if (session?.user && (session.user as any).id === params.id) {
    return NextResponse.json(
      { error: "No podés eliminarte a vos mismo." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuario inexistente." }, { status: 404 });
  }

  await prisma.user.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}