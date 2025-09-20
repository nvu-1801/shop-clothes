export const runtime = "nodejs"; // đảm bảo không chạy Edge

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 12)));

  const where = q ? { name: { contains: q, mode: "insensitive" } } : {};
  const [total, data] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = ProductSchema.parse(body); // validate

    const created = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        // 🔧 ép sang Prisma.Decimal để tránh lỗi runtime Decimal
        price: data.price,
        image: data.image ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/products error:", e);
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: "ValidationError", details: e.flatten() }, { status: 400 });
    }
    // Prisma lỗi thường gặp: unique/constraint/validation
    if (e?.code) {
      return NextResponse.json({ error: "PrismaError", code: e.code, message: e.message }, { status: 500 });
    }
    return NextResponse.json({ error: "InternalServerError", message: String(e?.message ?? e) }, { status: 500 });
  }
}
