const { listFolderFiles } = require('./drive_inventory')
const { inferFamily } = require('./family_inference')

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
    pending: rows.filter(({ status }) => status !== 'CONFIRMED'),
  }
}

module.exports = { runInventory }
