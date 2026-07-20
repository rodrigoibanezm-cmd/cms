const { google } = require('googleapis')
const { inferFamily } = require('../../../tools/template_inventory/family_inference')

function authOptions() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  return raw ? { credentials: JSON.parse(raw) } : {}
}

async function listFolderFiles(folderId) {
  const auth = new google.auth.GoogleAuth({
    ...authOptions(),
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
  const drive = google.drive({ version: 'v3', auth })
  const files = []
  let pageToken

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken,files(id,name,mimeType)',
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })
    files.push(...(response.data.files || []))
    pageToken = response.data.nextPageToken
  } while (pageToken)

  return files.filter(({ mimeType }) => mimeType !== 'application/vnd.google-apps.folder')
}

function countStatuses(rows) {
  return rows.reduce((counts, row) => {
    counts[row.status] = (counts[row.status] || 0) + 1
    return counts
  }, {})
}

async function runInventory(folderId) {
  const files = await listFolderFiles(folderId)
  const rows = files
    .map((file) => ({ filename: file.name, ...inferFamily(file.name) }))
    .sort((a, b) => a.filename.localeCompare(b.filename))

  return {
    total: rows.length,
    counts: countStatuses(rows),
    results: rows,
    pending: rows.filter(({ status }) => status !== 'CONFIRMED'),
  }
}

module.exports = { runInventory }
