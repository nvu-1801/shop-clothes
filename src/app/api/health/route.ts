export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    // log ra function logs & trả về message để dễ soi
    console.error('HEALTH ERROR', e);
    return NextResponse.json({ ok: false, error: String((e as any)?.message ?? e) }, { status: 500 });
  }
}
