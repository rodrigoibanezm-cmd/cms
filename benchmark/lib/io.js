import fs from "fs";
import path from "path";

export function readText(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

export function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

export function imageToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mediaType = ext === ".png" ? "image/png" : "image/jpeg";

  return {
    base64: buffer.toString("base64"),
    mediaType,
  };
}

export function parseModelJson(raw) {
  try {
    return JSON.parse(String(raw).replace(/```json|```/g, "").trim());
  } catch {
    return {
      _raw: raw,
      _parse_error: true,
    };
  }
}

export function saveJson(targetDir, ot, name, data) {
  fs.mkdirSync(targetDir, { recursive: true });
  const outPath = path.join(targetDir, `${ot}_${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`OK ${name}: ${outPath}`);
  return data;
}
