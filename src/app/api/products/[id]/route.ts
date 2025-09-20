export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const item = await prisma.product.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "NotFound" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const json = await req.json();
    const parsed = ProductSchema.partial()
      .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" })
      .parse(json);

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...parsed,
        price: parsed.price !== undefined ? parsed.price : undefined,
        image: parsed.image ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    console.error("PUT /api/products/:id error:", e);

    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return NextResponse.json({ error: "NotFound" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "PrismaError", code: e.code, message: e.message },
        { status: 500 }
      );
    }
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "ValidationError", details: e.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "InternalServerError" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    console.error("DELETE /api/products/:id error:", e);

    if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "NotFound" }, { status: 404 });
    }
    return NextResponse.json({ error: "InternalServerError" }, { status: 500 });
  }
}
