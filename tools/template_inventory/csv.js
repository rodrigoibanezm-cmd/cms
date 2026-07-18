const fs = require('fs')
const path = require('path')

function escapeCsv(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function writeInventory(rows, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  const header = ['archivo', 'familia_inferida', 'estado']
  const lines = [header, ...rows.map((row) => [row.filename, row.family, row.status])]
  fs.writeFileSync(outputPath, lines.map((line) => line.map(escapeCsv).join(',')).join('\n'))
}

module.exports = { writeInventory }
