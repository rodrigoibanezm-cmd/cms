import sys
import fitz

pdf_path = sys.argv[1]
out_path = sys.argv[2]

doc = fitz.open(pdf_path)
page = doc[0]
pix = page.get_pixmap(dpi=200)
pix.save(out_path)
