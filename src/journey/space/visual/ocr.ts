// The editor supplies only the flattened crop (including its mosaic), never the original frame.
export async function readMarkedImage(source: HTMLCanvasElement): Promise<string> {
  const { createWorker, OEM, PSM } = await import('tesseract.js')
  const base = new URL('space-ocr/v1/', document.baseURI)
  const worker = await createWorker(['chi_sim', 'eng'], OEM.LSTM_ONLY, {
    workerPath: new URL('worker.min.js', base).href, workerBlobURL: false,
    corePath: new URL('tesseract-core-lstm.wasm.js', base).href, langPath: base.href,
    errorHandler: () => { /* The rejected job is surfaced in the editor. */ },
  })
  try {
    const ratio = Math.min(2, 2500 / Math.max(source.width, source.height), Math.sqrt(3000000 / (source.width * source.height)))
    const out = document.createElement('canvas')
    out.width = Math.max(1, Math.round(source.width * ratio)); out.height = Math.max(1, Math.round(source.height * ratio))
    const ctx = out.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(source, 0, 0, out.width, out.height)
    const pixels = ctx.getImageData(0, 0, out.width, out.height), d = pixels.data
    let dark = 0, count = 0
    for (let i = 0; i < d.length; i += 4 * 43) { if (.299*d[i]+.587*d[i+1]+.114*d[i+2] < 110) dark++; count++ }
    if (dark > count*.6) {
      for (let i = 0; i < d.length; i += 4) { const gray = 255-(.299*d[i]+.587*d[i+1]+.114*d[i+2]); d[i]=d[i+1]=d[i+2]=gray }
      ctx.putImageData(pixels, 0, 0)
    }
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT, user_defined_dpi: '180' })
    const first = (await worker.recognize(out)).data.text.trim()
    if (first) return first
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK })
    return (await worker.recognize(out)).data.text.trim()
  } finally { await worker.terminate() }
}
