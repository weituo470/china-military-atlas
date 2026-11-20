export function SourceText({ text }: { text: string }) {
  return <>{text.split(/(https?:\/\/[^\s()（）。，；、]+)/g).map((part, i) => {
    if (!/^https?:/.test(part)) return part
    const url = part.replace(/[.,;]+$/, '')
    return <a key={i} href={url} target="_blank" rel="noreferrer">{new URL(url).hostname}</a>
  })}</>
}
