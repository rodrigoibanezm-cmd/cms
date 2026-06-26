import argparse
import tempfile
from pathlib import Path

from clean_xlsx import clean_template
from drive_io import XLSX_MIME, download_file, drive_service, folder_id, list_children, upload_xlsx


def pick_candidate(files):
    xlsx = [f for f in files if f.get("mimeType") == XLSX_MIME]
    if not xlsx:
        raise RuntimeError("No xlsx candidates found")
    return sorted(xlsx, key=lambda f: int(f.get("size") or 0), reverse=True)[0]


def find_family_folder(service, parent_id, family):
    folders = list_children(service, parent_id)
    for item in folders:
        if item["name"].upper() == family.upper():
            return item
    raise RuntimeError(f"Family folder not found: {family}")


def build_family(service, candidates_id, bases_id, family, workdir):
    folder = find_family_folder(service, candidates_id, family)
    source = pick_candidate(list_children(service, folder["id"], XLSX_MIME))
    source_path = Path(workdir) / f"{family}_source.xlsx"
    out_name = f"{family.upper()}_TECNICOS_BASE.xlsx"
    out_path = Path(workdir) / out_name
    download_file(service, source["id"], source_path)
    clean_template(source_path, out_path)
    uploaded = upload_xlsx(service, bases_id, out_path, out_name)
    print(f"OK {family}: {uploaded['name']} <- {source['name']}")
    print(uploaded.get("webViewLink", ""))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bases-folder", required=True)
    parser.add_argument("--candidates-folder", required=True)
    parser.add_argument("--families", required=True)
    args = parser.parse_args()
    service = drive_service()
    families = [x.strip() for x in args.families.split(",") if x.strip()]
    with tempfile.TemporaryDirectory() as workdir:
        for family in families:
            build_family(service, folder_id(args.candidates_folder), folder_id(args.bases_folder), family, workdir)


if __name__ == "__main__":
    main()
