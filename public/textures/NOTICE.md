# Illustrative globe textures

These four equirectangular maps were rendered for the open-source edition. They are **not** satellite photographs. They contain no administrative boundaries, observed terrain, city-light observations or weather measurements. They are for a soft-lit educational globe, not navigation.

| File | Contents |
| --- | --- |
| `earth-day-4k.webp` | 4096 × 2048. Generalized land polygons with an original atlas palette, synthetic surface shading, a graticule and a softened coastal rim. |
| `earth-night.jpg` | 2048 × 1024. Dark coast and land tints, with no actual cities or measured light intensities. |
| `earth-specular.jpg` | 2048 × 1024. Ocean/land mask; white represents water. |
| `earth-clouds-2k.webp` | 2048 × 1024. Original, procedurally drawn cloud-like ribbons, unrelated to any specific time. |

**Geography:** Made with [Natural Earth 1:110m land polygons](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/). The land outlines were rasterized from [`ne_110m_land.geojson`, repository tag v5.1.2](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_land.geojson), SHA-256 `9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9`. Natural Earth dedicates its vector and raster data to the [public domain](https://www.naturalearthdata.com/about/terms-of-use/). The small scale simplifies coastlines and omits smaller islands.

**New artwork:** The coloration, masks as rendered, night shading and cloud design contributed to this release are provided under the [repository's MIT License](../../LICENSE). The geographic source remains public domain. None of the four files reuses the production site's previous globe artwork.
