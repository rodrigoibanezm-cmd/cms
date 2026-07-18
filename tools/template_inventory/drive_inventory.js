const { google } = require('googleapis')

function authOptions() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) return {}
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  return { credentials }
}

async function listFolderFiles(folderId) {
  const auth = new google.auth.GoogleAuth({
    ...authOptions(),
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  })
  const drive = google.drive({ version: 'v3', auth })
  const files = []
  let pageToken

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken,files(id,name,mimeType,webViewLink)',
      pageSize: 1000,
      pageToken
    })
    files.push(...(response.data.files || []))
    pageToken = response.data.nextPageToken
  } while (pageToken)

  return files.filter((file) => file.mimeType !== 'application/vnd.google-apps.folder')
}

module.exports = { listFolderFiles }
