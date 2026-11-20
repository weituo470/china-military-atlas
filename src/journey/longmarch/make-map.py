"""Crop the public-domain Natural Earth II relief to match the atlas SVG projection."""
from io import BytesIO
from pathlib import Path
from sys import argv
from zipfile import ZipFile
from PIL import Image, ImageOps, ImageEnhance

HERE = Path(__file__).resolve().parent
with ZipFile(argv[1]) as archive:
    name = next(n for n in archive.namelist() if n.endswith('.tif'))
    im = Image.open(BytesIO(archive.read(name))).convert('RGB')
west, east, south, north = 92, 117, 23, 39
def x(lon): return (lon + 180) * im.width / 360
def y(lat): return (90 - lat) * im.height / 180
plate = im.transform((1600, 1056), Image.Transform.EXTENT,
                     (x(west),y(north),x(east),y(south)),
                     resample=Image.Resampling.BICUBIC)
tone = ImageEnhance.Contrast(ImageOps.grayscale(plate)).enhance(0.9)
plate = ImageOps.colorize(tone, '#625443', '#fff5d9', mid='#b8ad92')
plate = Image.blend(plate, Image.new('RGB', plate.size, '#efe6ce'), 0.39)
plate.save(HERE / 'relief.webp', quality=91)

