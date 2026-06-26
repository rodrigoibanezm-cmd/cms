const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const folders = require("../config/drive-folders.json");

const ROOT = process.argv[2]
  || "C:\\Rodrigo\\NexusG\\Marcelo\\OneDrive_1_24-06-2026";
const TARGET = folders.folders.plantillas_rescatadas;
const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function isReportXlsx(file) {
  const name = path.basename(file).toUpperCase();
  return name.endsWith(".XLSX")
    && name.includes("INFORM")
    && !name.includes("CERTIFICADO");
}

function otFromFile(file) {
  const match = path.basename(file).match(/^(\d{5})/);
  return match ? match[1] : "SIN_OT";
}

async function authClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/drive.file"]
  });
  return auth.getClient();
}

async function upload(drive, file) {
  const name = `${otFromFile(file)}__${path.basename(file)}`;
  const media = { mimeType: MIME, body: fs.createReadStream(file) };
  const requestBody = { name, parents: [TARGET], mimeType: MIME };
  const res = await drive.files.create({ requestBody, media, fields: "id,name" });
  console.log(`OK ${res.data.name} ${res.data.id}`);
}

async function main() {
  const files = walk(ROOT).filter(isReportXlsx);
  console.log(`Informes XLSX encontrados: ${files.length}`);
  const auth = await authClient();
  const drive = google.drive({ version: "v3", auth });
  for (const file of files) await upload(drive, file);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
