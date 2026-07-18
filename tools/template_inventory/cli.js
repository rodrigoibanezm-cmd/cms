const path = require('path')
const { listFolderFiles } = require('./drive_inventory')
const { inferFamily } = require('./family_inference')
const { writeInventory } = require('./csv')

function argument(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : null
}

async function main() {
  const folderId = argument('--reports-folder')
  const output = argument('--output') || 'outputs/template_inventory'
  if (!folderId) throw new Error('Missing --reports-folder')

  const files = await listFolderFiles(folderId)
  const rows = files
    .map((file) => ({ filename: file.name, ...inferFamily(file.name) }))
    .sort((a, b) => a.filename.localeCompare(b.filename))

  writeInventory(rows, path.join(output, 'informes_reales.csv'))
  const counts = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  console.log(`Informes inventariados: ${rows.length}`)
  console.log(`Confirmados: ${counts.CONFIRMED || 0}`)
  console.log(`En revisión: ${counts.REVIEW || 0}`)
  console.log(`Sin mapear: ${counts.UNMAPPED || 0}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
