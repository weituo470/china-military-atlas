# Third-party notices

The root license covers original contributions only. The following files retain their own terms. Product names, publishers and institutions identify sources and do not imply endorsement. Published-source links in guide entries are bibliographic references, not permission to copy their websites or photographs.

## Science and space photographs

Files are in `src/journey/space/plates/`. The licenses below apply to the distributed adaptations, including the two share-alike photographs. Source pages identify the authors and original works. The adjacent JSON credit records contain bilingual edits and context.

- `dfh.webp` - [DFH-1 Satellite.jpg](<https://commons.wikimedia.org/wiki/File:DFH-1_Satellite.jpg>), Brücke-Osteuropa. [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Cropped to 16:9, lightly tone-adjusted, resized and encoded as WebP.
- `launch.webp` - [Long March 5 Y8 rollout 02.png](<https://commons.wikimedia.org/wiki/File:Long_March_5_Y8_rollout_02.png>), 中国新闻社 / China News Service. [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Based on the credited Commons video still, cropped to 16:9, lightly tone-adjusted and encoded as WebP.
- `tiangong.webp` - [CSSphase1.jpg](<https://commons.wikimedia.org/wiki/File:CSSphase1.jpg>), Jiang Zhihong et al. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Cropped to 16:9, lightly tone-adjusted, resized and encoded as WebP.
- `fast.webp` - [202508 FAST (Five-hundred-meter Aperture Spherical radio Telescope).jpg](<https://commons.wikimedia.org/wiki/File:202508_FAST_(Five-hundred-meter_Aperture_Spherical_radio_Telescope).jpg>), SCJiang. [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Cropped to 16:9, lightly tone-adjusted, resized and encoded as WebP.
- `beidou.webp` - [Beidou-3 Satellite Mockup.jpg](<https://commons.wikimedia.org/wiki/File:Beidou-3_Satellite_Mockup.jpg>), AKAMGO yalms. [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). A native 1280×720 detail crop from a 1920×1441 photograph; wing tips and part of the upper mesh antenna are outside the frame. No upscaling or retouching. Converted to WebP and shared under CC BY-SA 4.0.

Original video behind the Long March still: [China News Service](https://www.youtube.com/watch?v=mvcW4FIMhlA).

## Long March guide photograph

- `src/journey/longmarch/zunyi-2024.webp`: [Zunyi Conference Site](https://www.flickr.com/photos/7138083@N04/55410620039/) by xiquinhosilva, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Converted to WebP. A modern photograph of the historic site, not a contemporary photograph of the conference.

## Basemaps

- `src/journey/korea/atlas/coasts.json` derives from [Natural Earth Admin 0 Countries, 1:50m](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/) v5.1.1: regional polygon shapes were combined, cropped, simplified and projected. [Reproduction script](src/journey/korea/atlas/build-coasts.py).
- `src/journey/longmarch/relief.webp` derives from [Natural Earth II 1:50m](https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-2/): the project cropped the regional relief, resampled, tinted and encoded it as WebP. [Reproduction script](src/journey/longmarch/make-map.py).
- Under the [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/), the upstream raster and vector data are public domain. Made with Natural Earth, by Tom Patterson, Nathaniel Vaughn Kelso and contributors. Contemporary basemaps are used for orientation, not as documentary evidence of political boundaries at the time.

## Flag icons

The twelve SVGs in `public/flags/` are [flag-icons](https://github.com/lipis/flag-icons), copyright (c) 2013 Panayiotis Lipiridis. The distributed vectors are under the [MIT terms and copyright notice](public/flags/LICENSE.txt); use of national symbols remains distinct from their SVG licenses.

## Local OCR

Versioned directory: [public/space-ocr/v1](public/space-ocr/v1/). The OCR worker and core here are unchanged distribution files from the pinned npm packages. Models are the upstream traineddata files compressed with gzip; decompressed bytes match the 4.1.0 upstream Git blobs.

- `worker.min.js`: [Tesseract.js 7.0.0](https://github.com/naptha/tesseract.js/tree/v7.0.0), [Apache License 2.0](public/space-ocr/v1/LICENSE-Tesseract-JS.txt). See the [bundle notice](public/space-ocr/v1/worker.min.js.LICENSE.txt). The complete notices for base64-js, bmp-js, buffer, idb-keyval, ieee754, is-url, regenerator-runtime, wasm-feature-detect and zlibjs are in the licenses directory below.
- `tesseract-core-lstm.wasm.js`: [Tesseract.js-core 7.0.0](https://github.com/naptha/tesseract.js-core/tree/v7.0.0), [Apache License 2.0](public/space-ocr/v1/LICENSE-core.txt), with the native dependencies listed in the [pinned build recipe](https://github.com/naptha/tesseract.js-core/blob/v7.0.0/build.sh). The JPEG implementation is based in part on the work of the Independent JPEG Group.
- `eng.traineddata.gz` and `chi_sim.traineddata.gz`: [tessdata_fast 4.1.0](https://github.com/tesseract-ocr/tessdata_fast/tree/4.1.0), [Apache License 2.0](public/space-ocr/v1/licenses/tessdata-fast.txt).

See [OCR notices](public/space-ocr/v1/NOTICE.txt) and [complete dependency license texts](public/space-ocr/v1/licenses/). The native dependency notices below correspond to the Git revisions referenced by the core release:

- giflib: [local notice](public/space-ocr/v1/licenses/core-giflib.txt); [upstream](<https://raw.githubusercontent.com/mirrorer/giflib/fa37672085ce4b3d62c51627ab3c8cf2dda8009a/COPYING>).
- leptonica: [local notice](public/space-ocr/v1/licenses/core-leptonica.txt); [upstream](<https://raw.githubusercontent.com/DanBloomberg/leptonica/4af068b56a9674da915debea4ed7e1b9885b17e8/leptonica-license.txt>).
- libjpeg: [local notice](public/space-ocr/v1/licenses/core-libjpeg.txt); [upstream](<https://raw.githubusercontent.com/LuaDist/libjpeg/6c0fcb8ddee365e7abc4d332662b06900612e923/README>).
- libpng: [local notice](public/space-ocr/v1/licenses/core-libpng.txt); [upstream](<https://raw.githubusercontent.com/glennrp/libpng/a37d4836519517bdce6cb9d956092321eca3e73b/LICENSE>).
- libtiff: [local notice](public/space-ocr/v1/licenses/core-libtiff.txt); [upstream](<https://raw.githubusercontent.com/libsdl-org/libtiff/b51bb157123264e26d34c09cc673d213aea61fc7/COPYRIGHT>).
- libwebp: [local notice](public/space-ocr/v1/licenses/core-libwebp.txt); [upstream](<https://raw.githubusercontent.com/webmproject/libwebp/20ef03ee351d4ff03fc5ff3ec4804a879d1b9d5c/COPYING>).
- libwebp: patent grant: [local notice](public/space-ocr/v1/licenses/core-libwebp-patents.txt); [upstream](<https://raw.githubusercontent.com/webmproject/libwebp/20ef03ee351d4ff03fc5ff3ec4804a879d1b9d5c/PATENTS>).
- openlibm: [local notice](public/space-ocr/v1/licenses/core-openlibm.txt); [upstream](<https://raw.githubusercontent.com/JuliaMath/openlibm/ae2d91698508701c83cab83714d42a1146dccf85/LICENSE.md>).
- tesseract: [local notice](public/space-ocr/v1/licenses/core-tesseract.txt); [upstream](<https://raw.githubusercontent.com/Balearica/tesseract/2a9c1c49c360462733c386d2a44fcd22c4e21411/LICENSE>).
- zlib: [local notice](public/space-ocr/v1/licenses/core-zlib.txt); [upstream](<https://raw.githubusercontent.com/madler/zlib/21767c654d31d2dccdde4330529775c6c5fd5389/README>).

## Excluded media and runtime dependencies

News screenshots, non-cleared archive and agency photos, mission media without asset-specific clearance, third-party Earth textures, voice tracks, video files and presentation artwork are not granted a new license by this repository. Displaying a source link, caption or historical reference is not distribution of the original media.

npm dependencies are not vendored as source; releases that bundle them must also retain the applicable upstream license texts and notices.

## Globe textures

The four replacement maps in `public/textures/` are stylized illustrations derived from the public-domain Natural Earth 1:110m land dataset. They are not satellite imagery, observed cloud cover or measured light emissions. For the exact source version, modifications and license, see the [globe texture notice](public/textures/NOTICE.md).
