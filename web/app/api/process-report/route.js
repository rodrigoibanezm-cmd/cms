import fs from 'fs';
import os from 'os';
import path from 'path';
import { NextResponse } from 'next/server';
import { runExtraction } from '../../../lib/process_pipeline.js';
import { generateFinalXls } from '../../../lib/xls_generator.js';
import { addReportFile, createReport } from '../../../lib/report_store.js';
import { markExtracted, markReportError, markXlsGenerated } from '../../../lib/report_updates.js';

export const runtime = 'nodejs';

function repoRoot() {
  return path.basename(process.cwd()) === 'web'
    ? path.resolve(process.cwd(), '..')
    : process.cwd();
}

function readText(relativePath) {
  return fs.readFileSync(path.join(repoRoot(), relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

async function fileToBuffer(file) {
  return Buffer.from(await file.arrayBuffer());
}

function asImage(buffer, mimeType) {
  return { base64: buffer.toString('base64'), mediaType: mimeType || 'image/jpeg' };
}

function colorFrom(semaforo) {
  if (semaforo === 'VERDE') return 'green';
  if (semaforo === 'ROJO') return 'red';
  return 'yellow';
}

function requireImage(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('El informe debe subirse como imagen.');
}

function otFromFilename(filename) {
  const match = String(filename || '').match(/^(\d{4,6})\b/);
  return match?.[1] || '';
}

async function registerInputFiles(reportId, report, photos) {
  await addReportFile(reportId, {
    kind: 'original_report',
    filename: report.name || 'informe',
    mimeType: report.type || 'image/jpeg',
  });

  await Promise.all(photos.map((file) => addReportFile(reportId, {
    kind: 'detail_photo',
    filename: file.name || 'foto.jpg',
    mimeType: file.type || 'image/jpeg',
  })));
}

export async function POST(request) {
  let reportRow = null;
  try {
    const form = await request.formData();
    const report = form.get('report');
    const photos = form.getAll('photos');

    if (!report || !photos.length) {
      return NextResponse.json(
        { ok: false, color: 'yellow', message: 'Falta informe o fotos de detalle.' },
        { status: 400 }
      );
    }

    requireImage(report);
    const sourceName = report.name || 'informe';
    const userOt = String(form.get('ot') || '').trim();
    const otHint = userOt || otFromFilename(sourceName);
    reportRow = await createReport({ ot: otHint, sourceName });
    await registerInputFiles(reportRow.id, report, photos);

    const reportBuffer = await fileToBuffer(report);
    const targetDir = path.join(os.tmpdir(), 'cms-extractions', otHint || reportRow.id);
    const extraction = await runExtraction({
      image: asImage(reportBuffer, report.type),
      otHint,
      sourceName,
      targetDir,
      promptPass1: readText('benchmark/prompts/extract_pass1.md'),
      promptPass2Template: readText('benchmark/prompts/extract_pass2.md'),
      catalog: readJson('benchmark/catalog/family_catalog.json'),
    });
    await markExtracted(reportRow.id, extraction);

    const photoPayload = await Promise.all(
      photos.map(async (file, index) => ({
        filename: file.name || `foto_${index + 1}.jpg`,
        mimeType: file.type || 'image/jpeg',
        buffer: await fileToBuffer(file),
      }))
    );

    const xls = await generateFinalXls({ extraction, photos: photoPayload });
    await markXlsGenerated(reportRow.id, xls);
    await addReportFile(reportRow.id, {
      kind: 'generated_xls',
      filename: xls.filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      driveFileId: xls.drive_file_id,
      url: xls.excel_url,
    });

    return NextResponse.json({
      ok: true,
      report_id: reportRow.id,
      color: colorFrom(extraction.semaforo),
      message: `Informe procesado. Excel generado: ${xls.filename}`,
      ot: extraction.ot,
      semaforo: extraction.semaforo,
      confidence_score: extraction.confidence_score,
      template_filename: extraction.template_filename,
      excel_url: xls.excel_url,
      drive_file_id: xls.drive_file_id,
    });
  } catch (err) {
    console.error(err);
    if (reportRow?.id) await markReportError(reportRow.id, err).catch(console.error);
    return NextResponse.json(
      { ok: false, color: 'red', message: err.message || 'Error procesando informe.' },
      { status: 500 }
    );
  }
}
