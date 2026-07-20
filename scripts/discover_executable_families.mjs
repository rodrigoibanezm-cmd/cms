import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CATALOG_DIR = 'catalog/versions/v1.0.0';
const FILE_PATTERN = /^executable_([a-z0-9_]+)\.json$/;

export function discoverExecutableFamilies(root = process.cwd()) {
  const catalogDir = path.join(root, CATALOG_DIR);
  return readdirSync(catalogDir)
    .map((filename) => ({ filename, match: filename.match(FILE_PATTERN) }))
    .filter(({ match }) => match)
    .map(({ filename, match }) => {
      const id = match[1];
      const catalog = JSON.parse(readFileSync(path.join(catalogDir, filename), 'utf8'));
      const families = Object.keys(catalog.families || {});
      assert.equal(families.length, 1, `${filename} must declare exactly one family`);
      assert.equal(families[0], id.toUpperCase(), `${filename} family must match its filename`);

      const test = `web/lib/executable_${id}.integration.test.mjs`;
      assert.ok(existsSync(path.join(root, test)), `${filename} is missing ${test}`);
      return { family: families[0], id, slug: id.replaceAll('_', '-'), test };
    })
    .sort((left, right) => left.family.localeCompare(right.family));
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) console.log(JSON.stringify({ include: discoverExecutableFamilies() }));
