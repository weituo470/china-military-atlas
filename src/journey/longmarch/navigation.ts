export type View='guide'|'compare'|'routes'
export const readQuery=()=>location.protocol==='file:' ? new URLSearchParams(location.hash.slice(1)) : new URL(location.href).searchParams
export const getView=():View=>{const v=readQuery().get('view');return v==='compare'||v==='routes'?v:'guide'}
export function writeQuery(update:(q:URLSearchParams)=>void,push=false){
  const url=new URL(location.href), offline=url.protocol==='file:', q=offline?readQuery():url.searchParams
  update(q);if(offline)url.hash=q.toString()
  if(url.href!==location.href)history[push?'pushState':'replaceState'](history.state,'',url)
}

