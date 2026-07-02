import fs from 'fs';
import os from 'os';
import path from 'path';
import { NextResponse } from 'next/server';
import { auditWithGemini } from '../../../lib/audit/gemini_auditor.js';
import { runExtraction } from '../../../lib/process_pipeline.js';
import { addReportFile, createReport } from '../../../lib/report_store.js';
import { markAudited, markExtracted, markReportError, markXlsGenerated } from '../../../lib/report_updates.js';
import { mergeRecoveryPatch } from '../../../lib/recovery/merge_patch.js';
import { runRecovery } from '../../../lib/recovery/recovery_runner.js';
import { generateFinalXls, publishGeneratedXls } from '../../../lib/xls_generator.js';

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

function isJsonPatchField(field) {
  const value = String(field || '');
  return Boolean(value) && !value.includes(' ') && !value.includes('-');
}

function hasRecoveryPatch(audit) {
  return (audit?.patches || []).some((patch) => isJsonPatchField(patch?.field));
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

async function registerXls(reportId, xls) {
  await markXlsGenerated(reportId, xls);
  await addReportFile(reportId, {
    kind: 'generated_xls',
    filename: xls.filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    driveFileId: xls.drive_file_id,
    url: xls.excel_url,
  });
}

async function publishFinalXls({ reportId, extraction, xls }) {
  const published = await publishGeneratedXls({ xls, extraction });
  await registerXls(reportId, published);
  return published;
}

async function runAuditor({ reportImage, xls, extraction }) {
  return auditWithGemini({ reportImage, xlsBuffer: xls.buffer, extraction });
}

async function generateAndAudit({ reportImage, extraction, photoPayload }) {
  const xls = await generateFinalXls({ extraction, photos: photoPayload, publish: false });
  const audit = await runAuditor({ reportImage, xls, extraction });
  return { xls, audit };
}

async function maybeRecover({ reportId, reportImage, extraction, photoPayload, audit }) {
  if (!hasRecoveryPatch(audit)) return null;

  const recovery = await runRecovery({ image: reportImage, extraction, audit });
  if (!recovery?.patch) return null;

  const recoveredExtraction = mergeRecoveryPatch(extraction, recovery.patch);
  await markExtracted(reportId, recoveredExtraction);
  const result = await generateAndAudit({
    reportImage,
    extraction: recoveredExtraction,
    photoPayload,
  });

  return { ...result, extraction: recoveredExtraction, recovery };
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
    const reportImage = asImage(reportBuffer, report.type);
    const targetDir = path.join(os.tmpdir(), 'cms-extractions', otHint || reportRow.id);
    let extraction = await runExtraction({
      image: reportImage,
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

    let { xls, audit } = await generateAndAudit({
      reportImage,
      extraction,
      photoPayload,
    });
    let recovery = null;

    const recovered = await maybeRecover({
      reportId: reportRow.id,
      reportImage,
      extraction,
      photoPayload,
      audit,
    });
    if (recovered) {
      ({ xls, audit, extraction, recovery } = recovered);
    }

    await markAudited(reportRow.id, audit);
    xls = await publishFinalXls({ reportId: reportRow.id, extraction, xls });

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
      audit,
      recovery,
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
