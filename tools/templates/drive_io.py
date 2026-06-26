import io
import re
from pathlib import Path

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

from auth import drive_credentials

XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
FOLDER_MIME = "application/vnd.google-apps.folder"


def drive_service():
    return build("drive", "v3", credentials=drive_credentials())


def folder_id(value):
    if not value:
        return value
    match = re.search(r"/folders/([A-Za-z0-9_-]+)", value)
    return match.group(1) if match else value


def list_children(service, parent_id, mime=None):
    clauses = [f"'{parent_id}' in parents", "trashed = false"]
    if mime:
        clauses.append(f"mimeType = '{mime}'")
    query = " and ".join(clauses)
    fields = "nextPageToken, files(id, name, mimeType, size)"
    items, token = [], None

    while True:
        res = service.files().list(
            q=query,
            fields=fields,
            pageToken=token,
            pageSize=100,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        ).execute()
        items.extend(res.get("files", []))
        token = res.get("nextPageToken")
        if not token:
            return items


def download_file(service, file_id, out_path):
    request = service.files().get_media(fileId=file_id)
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("wb") as fh:
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
    return out_path


def upload_xlsx(service, folder, path, name):
    media = MediaFileUpload(str(path), mimetype=XLSX_MIME, resumable=False)
    body = {"name": name, "parents": [folder_id(folder)]}
    return service.files().create(
        body=body,
        media_body=media,
        fields="id,name,webViewLink",
        supportsAllDrives=True,
    ).execute()
