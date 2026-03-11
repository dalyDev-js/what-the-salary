import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { salaries } from '@/db/schema';

// ─── GET /api/salaries/[id] ──────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  if (isNaN(numId))
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const [row] = await db
    .select()
    .from(salaries)
    .where(eq(salaries.id, numId))
    .limit(1);

  if (!row || row.isHidden)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Strip fingerprint from public response
  const { fingerprintHash: _fp, ...safe } = row;
  return NextResponse.json(safe);
}

// ─── PATCH /api/salaries/[id]  (admin moderation) ───────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId))
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const body = await req.json();
  const update: Partial<{ isHidden: boolean; isVerified: boolean }> = {};
  if (typeof body.isHidden === 'boolean') update.isHidden = body.isHidden;
  if (typeof body.isVerified === 'boolean') update.isVerified = body.isVerified;

  await db.update(salaries).set(update).where(eq(salaries.id, numId));

  return NextResponse.json({ success: true });
}
