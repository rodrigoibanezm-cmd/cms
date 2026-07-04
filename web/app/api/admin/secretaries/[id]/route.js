import { NextResponse } from 'next/server';
import { setSecretaryActive } from '../../../../../lib/secretary_store.js';

export const runtime = 'nodejs';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const secretary = await setSecretaryActive(id, body?.active !== false);
    if (!secretary) {
      return NextResponse.json({ ok: false, error: 'Secretaria no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, secretary });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}