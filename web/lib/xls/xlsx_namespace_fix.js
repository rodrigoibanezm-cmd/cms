import JSZip from 'jszip';

function normalizeXml(xml) {
  return xml
    .replace(/(<\/?)(x:)/g, '$1')
    .replace(/\sxmlns:x=/g, ' xmlns=');
}

export async function normalizeXlsxNamespaces(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const xmlFiles = Object.entries(zip.files).filter(([name]) => name.endsWith('.xml'));
  await Promise.all(xmlFiles.map(async ([name, file]) => {
    zip.file(name, normalizeXml(await file.async('string')));
  }));
  return zip.generateAsync({ type: 'nodebuffer' });
}
