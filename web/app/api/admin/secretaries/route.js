import { NextResponse } from 'next/server';
import { createSecretary, listSecretaries } from '../../../../lib/secretary_store.js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const secretaries = await listSecretaries();
    return NextResponse.json({ ok: true, secretaries });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const secretary = await createSecretary(body || {});
    return NextResponse.json({ ok: true, secretary });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}