import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/votes -> votos ya emitidos por el usuario logueado (para saber qué le falta votar)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const votes = await prisma.vote.findMany({
    where: { userId: (session.user as any).id },
    select: { categoryId: true },
  });

  return NextResponse.json(votes);
}

// POST /api/votes -> registra un voto. Espera multipart/form-data:
// categoryId (string), textAnswer (string, opcional), file (File, opcional)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const formData = await req.formData();
  const categoryId = formData.get("categoryId") as string | null;
  const textAnswer = formData.get("textAnswer") as string | null;
  const file = formData.get("file") as File | null;

  if (!categoryId) {
    return NextResponse.json(
      { error: "Falta indicar la categoría." },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Categoría inexistente." }, { status: 404 });
  }

  // Evita voto duplicado antes de tocar storage
  const already = await prisma.vote.findUnique({
    where: { userId_categoryId: { userId, categoryId } },
  });
  if (already) {
    return NextResponse.json(
      { error: "Ya votaste en esta categoría." },
      { status: 409 }
    );
  }

  let fileUrl: string | undefined;
  if (file && category.type !== "TEXT") {
    const blob = await put(`votes/${userId}/${categoryId}-${file.name}`, file, {
      access: "public",
    });
    fileUrl = blob.url;
  }

  if (category.type === "TEXT" && !textAnswer) {
    return NextResponse.json(
      { error: "Esta categoría requiere una respuesta de texto." },
      { status: 400 }
    );
  }
  if (category.type !== "TEXT" && !fileUrl) {
    return NextResponse.json(
      { error: "Esta categoría requiere subir un archivo." },
      { status: 400 }
    );
  }

  const vote = await prisma.vote.create({
    data: {
      userId,
      categoryId,
      textAnswer: textAnswer ?? undefined,
      fileUrl,
    },
  });

  return NextResponse.json(vote);
}
