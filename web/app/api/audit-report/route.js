import { NextResponse } from 'next/server';
import { auditWithGemini } from '../../../lib/audit/gemini_auditor.js';

export const runtime = 'nodejs';

async function fileToBuffer(file) {
  return Buffer.from(await file.arrayBuffer());
}

function asImage(buffer, mimeType) {
  return { base64: buffer.toString('base64'), mediaType: mimeType || 'image/jpeg' };
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const report = form.get('report');
    const xls = form.get('xls');
    const extractionRaw = String(form.get('extraction_json') || '{}');

    if (!report || !xls) {
      return NextResponse.json({ ok: false, message: 'Falta report o xls.' }, { status: 400 });
    }

    const reportBuffer = await fileToBuffer(report);
    const xlsBuffer = await fileToBuffer(xls);
    const extraction = JSON.parse(extractionRaw);
    const audit = await auditWithGemini({
      reportImage: asImage(reportBuffer, report.type),
      xlsBuffer,
      extraction,
    });

    return NextResponse.json({ ok: true, audit });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: err.message || 'Error auditando informe.' },
      { status: 500 }
    );
  }
}
