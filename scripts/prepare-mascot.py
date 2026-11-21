"""Prepare fox mascot images for the app.

Takes the big transparent PNGs made with ChatGPT (e.g. fox-waving.png)
and writes small, clean WebP files to public/mascot/:

1. Removes the faint haze / soft shadow some images have around the fox
   (pixels that are almost invisible become fully invisible).
2. Makes the fox itself fully solid (pixels that are almost solid become
   solid), so the grid paper never shows through the fur.
3. Trims the empty space around the fox, so every pose lines up the same.
4. Shrinks it to 360px tall (sharp on phones at about 120px on screen)
   and saves it as WebP (about 20-50 KB instead of about 1 MB).

Usage (needs Python with Pillow):
    python3 scripts/prepare-mascot.py "<folder with the PNGs>" waving celebrating
"""

import sys
from pathlib import Path

from PIL import Image

HEIGHT = 360  # output height in pixels
FAINT = 40  # alpha below this (out of 255) counts as haze: made invisible
SOLID = 200  # alpha at or above this counts as fox: made fully solid
PAD = 4  # empty pixels kept around the trimmed fox

out_dir = Path(__file__).resolve().parent.parent / "public" / "mascot"


def prepare(source: Path, target: Path):
    image = Image.open(source).convert("RGBA")

    alpha = image.getchannel("A").point(
        lambda a: 0 if a < FAINT else 255 if a >= SOLID else a
    )
    image.putalpha(alpha)

    left, top, right, bottom = alpha.getbbox()
    image = image.crop(
        (
            max(left - PAD, 0),
            max(top - PAD, 0),
            min(right + PAD, image.width),
            min(bottom + PAD, image.height),
        )
    )

    width = round(image.width * HEIGHT / image.height)
    image = image.resize((width, HEIGHT), Image.LANCZOS)
    image.save(target, "WEBP", quality=88, method=6)
    print(f"{target.name}: {width}x{HEIGHT}, {target.stat().st_size // 1024} KB")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    folder = Path(sys.argv[1])
    out_dir.mkdir(parents=True, exist_ok=True)

    for name in sys.argv[2:]:
        prepare(folder / f"fox-{name}.png", out_dir / f"fox-{name}.webp")


main()
