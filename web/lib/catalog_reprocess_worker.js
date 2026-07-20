import { db } from './db.js';
import { renderReport } from './versioned_report_renderer.js';
import { createCatalogReprocessWorker } from './catalog_reprocess_worker_runtime.mjs';

export async function processNextCatalogReprocessRequest() {
  const processNext = createCatalogReprocessWorker({ pool: db(), renderReport });
  return processNext();
}
