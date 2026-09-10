import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Falta el archivo de imagen." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo tiene que ser una imagen." }, { status: 400 });
  }

  const blob = await put(`profile/${userId}-${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { image: blob.url },
    select: { id: true, name: true, email: true, image: true, points: true },
  });

  return NextResponse.json(user);
}
