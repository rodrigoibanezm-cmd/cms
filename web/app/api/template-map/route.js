import { NextResponse } from 'next/server';
import { generateTemplateMap } from '../../../lib/template_mapper_service.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await generateTemplateMap({
      fileId: body.fileId,
      templateFilename: body.templateFilename,
      templateKey: body.templateKey,
      model: body.model,
    });

    return NextResponse.json({
      ok: true,
      template_key: result.map.template_key,
      template_filename: result.map.template_filename,
      validation_errors: result.validation_errors,
      map: result.map,
      inspected: body.includeInspected ? result.inspected : undefined,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: err.message || 'Error generando template map.' },
      { status: 500 }
    );
  }
}
