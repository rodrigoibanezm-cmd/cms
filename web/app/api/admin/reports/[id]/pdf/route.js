import { NextResponse } from 'next/server';
import { getOrCreateFinalPdf } from '../../../../../../lib/report_pdf.js';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const routeParams = await params;
    const result = await getOrCreateFinalPdf(routeParams.id);
    const url = result.file?.url;
    if (!url) return NextResponse.json({ ok: true, ...result });
    return NextResponse.redirect(url, 303);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
