const { runInventory } = require('../../../tools/template_inventory/run_inventory')

const REPORTS_FOLDER_ID = '1QSWVylHQNkqU0J_pJ4s6T5831CtGhnbM'

function authorized(req) {
  const expected = process.env.TEMPLATE_INVENTORY_TOKEN
  const provided = req.headers['x-inventory-token']
  return Boolean(expected && provided && provided === expected)
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!authorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const folderId = process.env.REPORTS_FOLDER_ID || REPORTS_FOLDER_ID
    const result = await runInventory(folderId)
    return res.status(200).json(result)
  } catch (error) {
    console.error('template-inventory failed', error)
    return res.status(500).json({ error: error.message })
  }
}
