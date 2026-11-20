export type Pt = {x:number; y:number}
export type Box = Pt & {width:number; height:number}
export type Tool = 'crop'|'pan'|'move'|'arrow'|'rect'|'ellipse'|'pen'|'text'|'mosaic'|'number'|'emoji'
export type Stroke = {kind:Exclude<Tool,'crop'|'move'|'pan'>; a:Pt; b:Pt; points:Pt[]; color:string; size:number; text?:string}
export const clamp = (n:number,lo:number,hi:number)=>Math.max(lo,Math.min(n,hi))
export const boxOf = (a:Pt,b:Pt):Box=>({x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(a.x-b.x),height:Math.abs(a.y-b.y)})
export const inside = (p:Pt,r:Box,slop=0)=>p.x>=r.x-slop && p.x<=r.x+r.width+slop && p.y>=r.y-slop && p.y<=r.y+r.height+slop
const font = 'system-ui, "Microsoft YaHei", sans-serif'
const fontSize = (m:Stroke)=>Math.max(10,m.size*4+6)
export function markBounds(m:Stroke):Box {
  const {a,b,size:s}=m
  if (m.kind==='emoji' || m.kind==='number') return {x:a.x-s*5,y:a.y-s*5,width:10*s,height:10*s}
  if (m.kind==='text') {
    const lines=(m.text||'').split('\n'), f=fontSize(m)
    return {x:a.x-f*.1,y:a.y-f*.12,width:Math.max(...lines.map(l=>[...l].reduce((n,c)=>n+(/[\x00-\x7f]/.test(c)?0.62:1)*f,0)),f)+f*.2,height:f*1.28*lines.length}
  }
  if(m.kind==='pen' && m.points.length) {
    let x=a.x,y=a.y,r=a.x,d=a.y
    for (const p of m.points){x=Math.min(x,p.x);y=Math.min(y,p.y);r=Math.max(r,p.x);d=Math.max(d,p.y)}
    return {x,y,width:r-x,height:d-y}
  }
  return boxOf(a,b)
}
export function shifted(m:Stroke,dx:number,dy:number):Stroke {
  const pt=(p:Pt)=>({x:p.x+dx,y:p.y+dy})
  return {...m,a:pt(m.a),b:pt(m.b),points:m.points.map(pt)}
}
export function drawMark(ctx:CanvasRenderingContext2D,m:Stroke) {
  const {a,b,color,size:s,kind}=m, r=boxOf(a,b)
  ctx.save()
  ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=s; ctx.lineCap='round';ctx.lineJoin='round'
  if(kind==='rect') ctx.strokeRect(r.x,r.y,r.width,r.height)
  if(kind==='ellipse'){ctx.beginPath();ctx.ellipse(r.x+r.width/2,r.y+r.height/2,r.width/2,r.height/2,0,0,Math.PI*2);ctx.stroke()}
  if(kind==='arrow'){
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)
    if(len>0){const ux=dx/len,uy=dy/len,head=Math.min(len*.52,Math.max(s*5,len*.13)), hw=head*.43
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x-head*.7*ux,b.y-head*.7*uy);ctx.stroke()
      ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-head*ux-hw*uy,b.y-head*uy+hw*ux);ctx.lineTo(b.x-head*ux+hw*uy,b.y-head*uy-hw*ux);ctx.closePath();ctx.fill()}
  }
  if(kind==='pen'){
    ctx.beginPath();ctx.moveTo(a.x,a.y);for(const p of m.points)ctx.lineTo(p.x,p.y);ctx.stroke()
    if(m.points.length<=1){ctx.beginPath();ctx.arc(a.x,a.y,s/2,0,Math.PI*2);ctx.fill()}
  }
  if(kind==='mosaic' && r.width>0 && r.height>0){
    const tiny=document.createElement('canvas'), block=Math.max(8,Math.round(s*3))
    tiny.width=Math.max(1,Math.ceil(r.width/block));tiny.height=Math.max(1,Math.ceil(r.height/block))
    const tc=tiny.getContext('2d')!
    tc.drawImage(ctx.canvas,r.x,r.y,r.width,r.height,0,0,tiny.width,tiny.height)
    ctx.imageSmoothingEnabled=false;ctx.drawImage(tiny,r.x,r.y,r.width,r.height)
  }
  if(kind==='text'){
    const f=fontSize(m);ctx.font='650 '+f+'px '+font;ctx.textBaseline='top'
    ctx.lineJoin='round';ctx.lineWidth=Math.max(1,f*.12);ctx.strokeStyle=color==='#171717'?'rgba(255,255,255,.85)':'rgba(16,20,25,.74)'
    for(const [i,l] of (m.text||'').split('\n').entries()){ctx.strokeText(l,a.x,a.y+i*f*1.28);ctx.fillText(l,a.x,a.y+i*f*1.28)}
  }
  if(kind==='number'){const radius=s*3.9
    ctx.beginPath();ctx.arc(a.x,a.y,radius,0,Math.PI*2);ctx.fill()
    ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,radius*.08);ctx.stroke()
    ctx.fillStyle=(color==='#ffffff'||color==='#ffd530'||color==='#54e8a8')?'#131d28':'#fff';ctx.textAlign='center';ctx.textBaseline='middle'
    ctx.font='700 '+(radius*1.25)+'px '+font;ctx.fillText(m.text||'1',a.x,a.y,radius*1.7)}
  if(kind==='emoji'){const f=s*7.5;ctx.textBaseline='middle';ctx.textAlign='center';ctx.font=f+'px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';ctx.fillText(m.text||'🙂',a.x,a.y)}
  ctx.restore()
}
export function croppedComposite(source:HTMLCanvasElement,box:Box) {
  // The source here is the rendered layer shared with the preview; never copy unmarked source pixels.
  const left=clamp(Math.floor(box.x),0,source.width-1), top=clamp(Math.floor(box.y),0,source.height-1)
  const w=Math.max(1,Math.min(source.width-left,Math.ceil(box.x+box.width)-left)),h=Math.max(1,Math.min(source.height-top,Math.ceil(box.y+box.height)-top))
  const out=document.createElement('canvas');out.width=w;out.height=h
  out.getContext('2d',{alpha:false})!.drawImage(source,left,top,w,h,0,0,w,h)
  return out
}
export function jpegForInbox(c:HTMLCanvasElement) {
  let out=c
  const k=Math.min(1,8192/c.width,8192/c.height,Math.sqrt(16777216/(c.width*c.height)))
  if(k<1){
    out=document.createElement('canvas');out.width=Math.max(1,Math.floor(c.width*k));out.height=Math.max(1,Math.floor(c.height*k))
    const ctx=out.getContext('2d')!;ctx.imageSmoothingQuality='high';ctx.drawImage(c,0,0,out.width,out.height)
  }
  for(let i=0;i<10;i++){
    for(const quality of [.91,.80,.68]){
      const url=out.toDataURL('image/jpeg',quality)
      if(url.startsWith('data:image/jpeg;base64,') && (url.length-23)*.75<=1024*1024) return url
    }
    const next=document.createElement('canvas');next.width=Math.max(1,Math.round(out.width*.78));next.height=Math.max(1,Math.round(out.height*.78))
    const c2=next.getContext('2d')!;c2.imageSmoothingQuality='high';c2.drawImage(out,0,0,next.width,next.height);out=next
  }
  throw Error('Image exceeds inbox limit')
}
