"""
Prints the numbers needed for src/common/form/form_map.ts from a new version of Council's form.

    pip install pypdf pdfplumber pillow
    python3 tools/measure_form.py public/assets/form.pdf

Text boxes come from the form's fill-in field widgets. Tick boxes are found by rendering
each page at 400 dpi and measuring the dark square inside every ☐ glyph. Needs pdftoppm.
All rectangles are [x0, y0, x1, y1] in points, origin bottom-left.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import pdfplumber
from PIL import Image
from pypdf import PdfReader

DPI = 400
BOX_GLYPHS = "☐□"


def field_widgets(path):
    reader = PdfReader(path)
    for page_index, page in enumerate(reader.pages):
        annots = page.get("/Annots")
        for ref in (annots.get_object() if annots else []):
            annot = ref.get_object()
            if annot.get("/Subtype") != "/Widget":
                continue
            parent = annot.get("/Parent")
            name = annot.get("/T") or (parent.get_object().get("/T") if parent else None)
            kind = annot.get("/FT") or (parent.get_object().get("/FT") if parent else None)
            rect = [round(float(v), 1) for v in annot["/Rect"]]
            yield page_index, str(name), str(kind), rect


def tick_squares(path):
    with tempfile.TemporaryDirectory() as tmp, pdfplumber.open(path) as pdf:
        subprocess.run(["pdftoppm", "-r", str(DPI), "-png", path, f"{tmp}/p"], check=True)
        images = sorted(Path(tmp).glob("p-*.png"))
        scale = DPI / 72
        for page_index, page in enumerate(pdf.pages):
            pixels = np.array(Image.open(images[page_index]).convert("L"))
            height = page.height
            for ch in page.chars:
                if ch["text"] not in BOX_GLYPHS:
                    continue
                # Search the glyph's own width (so neighbouring letters aren't included), and a
                # little above and below it, since some fonts draw the square outside the glyph box.
                x0, x1 = ch["x0"], ch["x1"]
                top, bottom = ch["top"] - 5, ch["bottom"] + 5
                crop = pixels[int(top * scale) : int(bottom * scale), int(x0 * scale) : int(x1 * scale)] < 128
                ys, xs = np.nonzero(crop)
                if not len(xs):
                    continue
                sx0 = x0 + xs.min() / scale
                sx1 = x0 + (xs.max() + 1) / scale
                s_top = top + ys.min() / scale
                s_bottom = top + (ys.max() + 1) / scale
                yield page_index, [round(float(v), 1) for v in (sx0, height - s_bottom, sx1, height - s_top)]


if __name__ == "__main__":
    form = sys.argv[1] if len(sys.argv) > 1 else "public/assets/form.pdf"
    print("Field widgets (use text fields for FORM.text):")
    for page, name, kind, rect in field_widgets(form):
        print(f"  page {page}  {kind:5} {rect}  {name}")
    print("\nTick squares, in the order they appear in the PDF (use for FORM.ticks):")
    for page, rect in tick_squares(form):
        print(f"  page {page}  {rect}")
