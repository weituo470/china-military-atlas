"""Regenerate from Natural Earth 1:50m admin_0_countries v5.1.1 ZIP.
Usage: python build-coasts.py path/to/ne_50m_admin_0_countries.zip
Optional development dependencies: pyshp and shapely. No network at runtime.
"""
import io
import json
import sys
import zipfile
from pathlib import Path
import shapefile
from shapely.geometry import box, shape
from shapely.ops import unary_union

with zipfile.ZipFile(sys.argv[1]) as archive:
    def stream(suffix):
        return io.BytesIO(archive.read(next(name for name in archive.namelist() if name.endswith(suffix))))
    reader = shapefile.Reader(shp=stream(".shp"), shx=stream(".shx"), dbf=stream(".dbf"), encoding="utf8")
    countries = {r.record.ADM0_A3: shape(r.shape.__geo_interface__) for r in reader.iterShapeRecords()
                 if r.record.ADM0_A3 in {"CHN","RUS","PRK","KOR","JPN"}}

def ring(points):
    xy = [f"{(lon-120.4)*.79*45:.1f},{(43.58-lat)*45:.1f}" for lon,lat in points[:-1]]
    return "M"+"L".join(xy)+"Z"

def coastline(ids, extent):
    geo = unary_union([countries[key] for key in ids]).intersection(box(*extent)).simplify(.009, preserve_topology=True)
    polygons = geo.geoms if geo.geom_type == "MultiPolygon" else [geo]
    return "".join(ring(list(poly.exterior.coords)) + "".join(ring(list(i.coords)) for i in poly.interiors)
                   for poly in polygons if poly.area >= .0006)

# Extend neighbors into the SVG letterbox. Do not show a modern N/S boundary.
wide = (115,27,142,50)
data = {"peninsula":coastline(["PRK","KOR"], (120.4,32.65,135.5,43.58)),
        "mainland":coastline(["CHN","RUS"],wide), "japan":coastline(["JPN"],wide)}
Path(__file__).with_name("coasts.json").write_text(json.dumps(data,separators=(",",":"))+"\n",encoding="ascii")

