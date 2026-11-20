import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointer } from 'react'
import { createPortal } from 'react-dom'
import { boxOf, clamp, drawMark, croppedComposite, inside, jpegForInbox, markBounds, shifted, type Box, type Pt, type Stroke, type Tool } from './markDrawing'
import { MarkIcon, toolNames, toolsList, type IconName } from './MarkTools'
import './editor.css'

export type MarkEditorProps={canvas:HTMLCanvasElement;lang:'zh'|'en';onDone:(image:string)=>void;onCancel:()=>void;onInspectText?:(box:Box,translate:boolean)=>string;onReadImage?:(image:HTMLCanvasElement)=>Promise<string>}
type Doc={crop:Box|null;marks:Stroke[]}
type Gesture = {kind:'new'|'pan'|'resize'|'draw'|'move'; id:number; start:Pt; last:Pt; crop:Box; hx:number;hy:number; mark:Stroke|null; index:number}
const palette=['#f34c4c','#ff9e40','#ffd530','#54e8a8','#4caaff','#c499ff','#ffffff','#171717']
const colorNames=[['红','Red'],['橙','Orange'],['黄','Yellow'],['绿','Green'],['蓝','Blue'],['紫','Purple'],['白','White'],['黑','Black']]
const emojis=['🙂','👍','❗','❓','⭐','🔍']
const blank=():Doc=>({crop:null,marks:[]})
const handles=(r:Box)=>Array.from({length:9},(_,i)=>({hx:i%3-1,hy:Math.floor(i/3)-1})).filter(h=>h.hx||h.hy).map(h=>({...h,x:r.x+(h.hx+1)*r.width/2,y:r.y+(h.hy+1)*r.height/2}))
const blob=(c:HTMLCanvasElement)=>new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(Error('bitmap unavailable')),'image/png'))
function download(b:Blob){const u=URL.createObjectURL(b),a=document.createElement('a');a.download='space-annotation.png';a.href=u;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000)}
export function MarkEditor({canvas,lang,onDone,onCancel,onInspectText,onReadImage}:MarkEditorProps){
  const zh=lang==='zh', l=(cn:string,en:string)=>zh?cn:en
  const dialog=useRef<HTMLDialogElement>(null), stage=useRef<HTMLDivElement>(null), view=useRef<HTMLCanvasElement>(null)
  const [cache]=useState(()=>document.createElement('canvas'))
  const h=useRef<{past:Doc[];now:Doc;future:Doc[]}>({past:[],now:blank(),future:[]})
  const [version,rev]=useState(0), refresh=()=>rev(n=>n+1), doc=h.current.now
  const [tool,setTool]=useState<Tool>('crop'), [width,setWidth]=useState(4),[color,setColor]=useState(palette[0]),[emoji,setEmoji]=useState(emojis[0])
  const [sel,setSel]=useState(-1), [dims,setDims]=useState([1,1]),[zoom,setZoom]=useState(false)
  const [input,setInput]=useState<{at:Pt;value:string}|null>(null),[extracted,setExtracted]=useState<{value:string;translate:boolean;ocr?:'loading'|'done'|'error'}|null>(null)
  const readEpoch=useRef(0), reading=useRef(false)
  function dismissPopup(){readEpoch.current++;reading.current=false;setInput(null);setExtracted(null)}
  useEffect(()=>()=>{readEpoch.current++;reading.current=false},[])
  const [msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[more,setMore]=useState(false)
  const g=useRef<Gesture|null>(null), [frame,frameNext]=useState(0), next=()=>frameNext(v=>v+1)
  const pan=useRef<{id:number;x:number;y:number;left:number;top:number}|null>(null)
  const W=canvas.width,H=canvas.height,full={x:0,y:0,width:W,height:H}, region=doc.crop??full
  const fit=Math.min(dims[0]/W,dims[1]/H,1.5), scale=Math.max(.0001,zoom?Math.max(fit*1.9,Math.min(1,dims[0]/W)):fit)
  function push(v:Doc){const s=h.current;s.past=[...s.past.slice(-99),s.now];s.now=v;s.future=[];refresh()}
  function history(redo=false){const s=h.current,from=redo?s.future:s.past,to=redo?s.past:s.future
    const d=from.pop();if(!d)return;to.push(s.now);s.now=d;g.current=null;setInput(null);setSel(-1);refresh()}
  function remove(){if(sel<0 || sel>=doc.marks.length)return;push({...doc,marks:doc.marks.filter((_,i)=>i!==sel)});setSel(-1)}
  function choose(t:Tool){setTool(t);g.current=null;setInput(null);setMore(false);setMsg('');if(t!=='move')setSel(-1);next()}
  useLayoutEffect(()=>{const el=dialog.current!;el.showModal();return()=>{if(el.open)el.close()}},[])
  useLayoutEffect(()=>{const el=stage.current!;const size=()=>setDims([Math.max(1,el.clientWidth-12),Math.max(1,el.clientHeight-12)])
    size();const ro=new ResizeObserver(size);ro.observe(el);return()=>ro.disconnect()},[])
  useLayoutEffect(()=>{const c=cache;if(c.width!==W)c.width=W;if(c.height!==H)c.height=H;const ctx=c.getContext('2d',{alpha:false})!;ctx.drawImage(canvas,0,0);doc.marks.forEach(m=>drawMark(ctx,m))},[cache,canvas,W,H,doc.marks])
  function cropNow(d:Gesture):Box{
    const {start,last,crop}=d
    if(d.kind==='pan')return {...crop,x:clamp(crop.x+last.x-start.x,0,W-crop.width),y:clamp(crop.y+last.y-start.y,0,H-crop.height)}
    if(d.kind==='resize'){
      const edgeX=d.hx<0?crop.x+crop.width:crop.x, edgeY=d.hy<0?crop.y+crop.height:crop.y
      return boxOf({x:d.hx?edgeX:crop.x,y:d.hy?edgeY:crop.y},{x:d.hx?last.x:crop.x+crop.width,y:d.hy?last.y:crop.y+crop.height})
    }
    return boxOf(start,last)
  }
  const pending=g.current
  const shown=pending && ['new','resize','pan'].includes(pending.kind)?cropNow(pending):region
  useLayoutEffect(()=>{
    const dest=view.current;if(!dest)return
    if(dest.width!==W)dest.width=W;if(dest.height!==H)dest.height=H
    const ctx=dest.getContext('2d',{alpha:false})!, d=g.current
    ctx.drawImage(cache,0,0)
    if(d?.kind==='draw' && d.mark)drawMark(ctx,d.mark)
    if(d?.kind==='move'){
      ctx.drawImage(canvas,0,0)
      doc.marks.forEach((m,i)=>drawMark(ctx,i===d.index?shifted(m,d.last.x-d.start.x,d.last.y-d.start.y):m))
    }
    ctx.save()
    const r=shown, u=1/scale
    if(doc.crop || (d && ['new','resize','pan'].includes(d.kind))){
      ctx.fillStyle='rgba(2,9,13,.65)';ctx.beginPath();ctx.rect(0,0,W,H);ctx.rect(r.x,r.y,r.width,r.height);ctx.fill('evenodd')
      ctx.lineWidth=1.6*u;ctx.strokeStyle='#43f0a5';ctx.strokeRect(r.x,r.y,r.width,r.height)
      if(tool==='crop'){ctx.fillStyle='#52f6b0';for(const p of handles(r)){ctx.fillRect(p.x-3.2*u,p.y-3.2*u,6.4*u,6.4*u)}}
    }
    if(sel>=0 && doc.marks[sel] && tool==='move'){
      const b=markBounds(doc.marks[sel]);if(d?.kind==='move'){b.x+=d.last.x-d.start.x;b.y+=d.last.y-d.start.y}
      ctx.lineWidth=u;ctx.setLineDash([4*u,3*u]);ctx.strokeStyle='#65ffb9';ctx.strokeRect(b.x-3*u,b.y-3*u,b.width+6*u,b.height+6*u)
    }
    ctx.restore()
  },[cache,canvas,W,H,scale,doc,version,frame,tool,sel,shown])
  useEffect(()=>{if(!msg)return;const timer=setTimeout(()=>setMsg(''),4500);return()=>clearTimeout(timer)},[msg])
  const actions=useRef({undo:()=>history(),redo:()=>history(true),remove,escape:()=>{}})
  actions.current={undo:()=>history(),redo:()=>history(true),remove,escape:()=>{if(input||extracted)dismissPopup();else if(more)setMore(false);else if(g.current){g.current=null;next()}else onCancel()}}
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if(e.isComposing)return
      const typing=(e.target as HTMLElement)?.matches('input,textarea,[contenteditable=true]')
      if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();actions.current.escape();return}
      if(typing)return
      if((e.ctrlKey||e.metaKey)&&(['z','y'].includes(e.key.toLowerCase()))){e.preventDefault();e.stopPropagation();if(e.shiftKey||e.key.toLowerCase()==='y')actions.current.redo();else actions.current.undo()}
      else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();actions.current.remove()}
    };document.addEventListener('keydown',key,true);return()=>document.removeEventListener('keydown',key,true)
  },[])
  function point(e:ReactPointer):Pt{const r=view.current!.getBoundingClientRect()
    return {x:clamp((e.clientX-r.left)*W/r.width,0,W),y:clamp((e.clientY-r.top)*H/r.height,0,H)}}
  const limited=(p:Pt):Pt=>({x:clamp(p.x,region.x,region.x+region.width),y:clamp(p.y,region.y,region.y+region.height)})
  const newStroke=(kind:Stroke['kind'],p:Pt):Stroke=>({kind,a:p,b:p,points:kind==='pen'?[p]:[],color,size:width/scale})
  function down(e:ReactPointer<HTMLCanvasElement>){if(g.current||input||extracted||busy||e.button!==0)return
    if(tool==='pan'){
      const scroll=view.current!.closest<HTMLElement>('.sme-scroll')!
      if(pan.current)return
      pan.current={id:e.pointerId,x:e.clientX,y:e.clientY,left:scroll.scrollLeft,top:scroll.scrollTop};view.current!.setPointerCapture(e.pointerId);return
    }
    const p=point(e);setMsg('');setMore(false)
    let kind:Gesture['kind']='draw',hx=0,hy=0,index=-1
    let mark:Stroke|null=null
    if(tool==='crop'){
      const hot=doc.crop?handles(region).filter(h=>Math.hypot(h.x-p.x,h.y-p.y)<(e.pointerType==='touch'?20:10)/scale).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]:null
      if(hot){kind='resize';hx=hot.hx;hy=hot.hy}else kind=doc.crop&&inside(p,region)?'pan':'new'
    }else{
      if(!inside(p,region))return
      if(tool==='move'){
        for(let i=doc.marks.length-1;i>=0;i--)if(inside(p,markBounds(doc.marks[i]),8/scale)){index=i;break}
        setSel(index); if(index<0)return; kind='move'
      }else if(tool==='text'){setInput({at:p,value:''});return}
      else if(tool==='number'||tool==='emoji'){
        const s=newStroke(tool,p);s.text=tool==='number'?String(doc.marks.filter(m=>m.kind==='number').length+1):emoji
        push({...doc,marks:[...doc.marks,s]});return
      }else mark=newStroke(tool,p)
    }
    view.current!.setPointerCapture(e.pointerId)
    g.current={kind,id:e.pointerId,start:p,last:p,crop:region,hx,hy,index,mark};next()
  }
  function update(e:ReactPointer<HTMLCanvasElement>){
    if(pan.current?.id===e.pointerId){const d=pan.current,scroll=view.current!.closest<HTMLElement>('.sme-scroll')!;scroll.scrollLeft=d.left+d.x-e.clientX;scroll.scrollTop=d.top+d.y-e.clientY;return}
    const d=g.current;if(!d||d.id!==e.pointerId)return
    const p=d.kind==='draw'?limited(point(e)):point(e);d.last=p
    if(d.mark){d.mark.b=p;if(d.mark.kind==='pen'&&d.mark.points.length<8000 && Math.hypot(p.x-d.mark.points.at(-1)!.x,p.y-d.mark.points.at(-1)!.y)*scale>.45)d.mark.points.push(p)}
    next()
  }
  function up(e:ReactPointer<HTMLCanvasElement>){if(pan.current?.id===e.pointerId){update(e);pan.current=null;return}const d=g.current;if(!d||d.id!==e.pointerId)return
    update(e);g.current=null
    if(d.kind==='draw'&&d.mark){if(d.mark.kind==='pen'||Math.hypot(d.last.x-d.start.x,d.last.y-d.start.y)*scale>=2)push({...doc,marks:[...doc.marks,d.mark]})}
    else if(d.kind==='move'){if(d.start.x!==d.last.x||d.start.y!==d.last.y)push({...doc,marks:doc.marks.map((m,i)=>i===d.index?shifted(m,d.last.x-d.start.x,d.last.y-d.start.y):m)})}
    else {const r=cropNow(d);if(r.width*scale>=6&&r.height*scale>=6)push({...doc,crop:r})}
    next()
  }
  function putText(){if(!input?.value.trim())return
    const s=newStroke('text',input.at);s.text=input.value.trim().split('\n').slice(0,12).join('\n');push({...doc,marks:[...doc.marks,s]});setInput(null)}
  function inspect(tr:boolean){setMore(false);setExtracted({value:onInspectText?.(region,tr)||'',translate:tr})}
  async function inspectBitmap(){
    if(!onReadImage||reading.current)return
    const epoch=++readEpoch.current;reading.current=true;setMore(false);setExtracted({value:'',translate:false,ocr:'loading'})
    try {
      const value=await onReadImage(croppedComposite(cache,region))
      if(readEpoch.current===epoch)setExtracted({value:value.trim(),translate:false,ocr:'done'})
    }catch{if(readEpoch.current===epoch)setExtracted({value:'',translate:false,ocr:'error'})}
    finally{if(readEpoch.current===epoch)reading.current=false}
  }
  async function output(mode:'done'|'save'|'copy'|'share'){if(busy)return;setBusy(true);setMore(false)
    try{
      const c=croppedComposite(cache,region)
      if(mode==='done'){onDone(jpegForInbox(c));return}
      const b=blob(c)
      if(mode==='copy'){
        if(!navigator.clipboard?.write||typeof ClipboardItem==='undefined'){setMsg(l('浏览器不支持复制图片，请使用保存。','Picture copy is unavailable. Use Save instead.'));return}
        await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);setMsg(l('已复制标注图。','Marked image copied.'))
      }else if(mode==='share'){
        const file=new File([await b],'space-annotation.png',{type:'image/png'})
        if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file]})
        else{download(file);setMsg(l('此浏览器不支持系统分享，已下载图片供分享。','System sharing is unavailable; image downloaded instead.'))}
      }else{download(await b);setMsg(l('已导出标注图。','Marked image exported.'))}
    }catch(err){if(!(err instanceof DOMException&&err.name==='AbortError'))setMsg(mode==='copy'?l('复制未获浏览器允许，可改用保存。','Clipboard access was denied. Use Save instead.'):l('未能完成，请缩小选区后重试。','Could not finish. Try a smaller selection.'))}
    finally{setBusy(false)}
  }
  const act=(name:IconName,label:string,fn:()=>void,disabled=false,showLabel=false)=> <button key={name} type="button" className={'sme-btn'+(name==='done'?' sme-done':'')} data-action={name} onClick={fn} disabled={disabled||busy} aria-label={label} title={label}><MarkIcon name={name}/>{showLabel&&<span>{label}</span>}</button>
  const help=tool==='crop'?l('拖出选区；拖动边框手柄可调整，框内可移动。','Drag to crop. Drag handles to resize, or drag inside to move.'):tool==='move'?l('点选并拖动一个标记；可删除已选标记。','Drag a mark to move it, or select one to delete.'):tool==='text'?l('点选文字的起始位置，再输入内容。','Click where the text should begin, then write a note.'):tool==='emoji'||tool==='number'?l('点击图中位置放置标记。','Click the image to place a mark.'):tool==='mosaic'?l('拖出矩形，为矩形内的像素打码。','Drag a rectangle to pixelate the area.'):l('在选区内拖动绘制。','Drag inside the selection to draw.')
  return createPortal(<dialog ref={dialog} className="space-mark-editor" aria-label={l('截图标注编辑器','Screenshot markup editor')} onCancel={e=>{e.preventDefault();actions.current.escape()}}>
    <div className="sme-shell">
      <header className="sme-head" inert={!!(input||extracted)}><div><b>{l('截图标注','Screenshot markup')}</b><span className="sme-readout">{Math.ceil(shown.width)} × {Math.ceil(shown.height)} px</span></div>
        <div>{act('cancel',l('取消','Cancel'),onCancel,false,true)}{act('done',l('完成','Done'),()=>void output('done'),!!input,true)}</div>
      </header>
      <div className="sme-stage" ref={stage} inert={!!(input||extracted)}><div className="sme-scroll"><div className="sme-center"><canvas data-mark-surface="" ref={view} style={{width:W*scale,height:H*scale,cursor:tool==='pan'?'grab':tool==='move'?'move':tool==='text'?'text':'crosshair'}}
          aria-label={l('冻结页面截图标注画布','Frozen page annotation canvas')}
          onPointerDown={down} onPointerMove={update} onPointerUp={up} onPointerCancel={e=>{if(pan.current?.id===e.pointerId)pan.current=null;if(g.current?.id===e.pointerId){g.current=null;next()}}}/></div></div></div>
      <div className="sme-controls" inert={!!(input||extracted)}>
        <div className="sme-hint" aria-live="polite"><strong>{toolNames[tool][zh?0:1]}</strong><span>{msg||(tool==='pan'?l('放大后拖动浏览；切回画笔即可继续标注。','Zoom in and drag to pan. Switch tools to resume drawing.'):help)}</span></div>
        <div className="sme-dock" role="toolbar" aria-label={l('绘图工具','Drawing tools')}>{toolsList.map(n=><button key={n} className="sme-btn" type="button" data-tool={n} aria-label={toolNames[n][zh?0:1]} title={toolNames[n][zh?0:1]} aria-pressed={tool===n} onClick={()=>choose(n)}><MarkIcon name={n}/></button>)}
          <i/>{act('undo',l('撤销','Undo'),()=>history(),!h.current.past.length)}{act('redo',l('重做','Redo'),()=>history(true),!h.current.future.length)}
          <button type="button" className="sme-btn" data-action="more" onClick={()=>setMore(!more)} aria-expanded={more} title={l('更多操作','More actions')} aria-label={l('更多操作','More actions')}><MarkIcon name="more"/></button>
        </div>
        <div className="sme-settings">
          {tool==='crop'||tool==='pan'?<>{tool==='crop'&&act('reset',l('重新框选','Reset crop'),()=>{push({...doc,crop:null});setSel(-1)},!doc.crop,true)}
            {act('zoom',zoom?l('适应画布','Fit to view'):l('放大查看','Zoom in'),()=>setZoom(!zoom),false,true)}
            <span className="sme-subtle">{doc.crop?l('仅保留框内区域','Only the framed area is kept'):l('未框选时使用整张图','Full image until you select a region')}</span></>
          :tool==='move'? act('delete',l('删除选中标记','Delete selected mark'),remove,sel<0,true)
          :<>{tool!=='mosaic'&&tool!=='emoji'&&<div className="sme-swatches" aria-label={l('颜色','Color')}>{palette.map((v,i)=><button key={v} type="button" className="sme-color" style={{'--swatch':v} as React.CSSProperties} aria-pressed={v===color} title={colorNames[i][zh?0:1]} aria-label={colorNames[i][zh?0:1]} onClick={()=>setColor(v)}/>)}</div>}
            {tool==='emoji'&&<div className="sme-emojis">{emojis.map(v=><button key={v} type="button" aria-pressed={emoji===v} onClick={()=>setEmoji(v)}>{v}</button>)}</div>}
            <label>{l('大小','Size')}<select value={width} onChange={e=>setWidth(Number(e.target.value))}><option value="2">{l('细','Small')}</option><option value="4">{l('中','Medium')}</option><option value="7">{l('粗','Large')}</option></select></label></>}
        </div>
        {more&&<div className="sme-menu">{act('save',l('保存图片','Save image'),()=>void output('save'),false,true)}{act('copy',l('复制图片','Copy image'),()=>void output('copy'),false,true)}
          {act('share',l('分享图片','Share image'),()=>void output('share'),false,true)}
          {onInspectText&&<>{act('inspect',l('提取选区文字','Extract page text'),()=>inspect(false),false,true)}{act('translate',l('选区译文','Translate page text'),()=>inspect(true),false,true)}</>}
          {onReadImage&&act('ocr',l('图片文字识别（OCR）','Read image text (OCR)'),()=>void inspectBitmap(),false,true)}</div>}
      </div>
      {(input||extracted)&&<div className="sme-shade"><section className="sme-popup" aria-label={l('文字','Text')}>
        <label>{input?l('添加文字','Add text'):extracted?.ocr?l('图片文字识别（OCR）','Read image text (OCR)'):extracted?.translate?l('选区对应译文','Translation of selected page text'):l('选区页面文字','Selected page text')}
          {input?<textarea data-mark-text="" autoFocus maxLength={360} rows={3} value={input.value} onChange={e=>setInput({...input,value:e.target.value})} onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&!e.nativeEvent.isComposing)putText()}}/>:
            <textarea readOnly autoFocus rows={5} aria-busy={extracted?.ocr==='loading'} value={extracted?.value||(extracted?.ocr==='loading'?l('正在识别选区图片，可随时关闭…','Reading the selected image. You can close this window…'):extracted?.ocr==='error'?l('识别失败，请缩小选区后重试。','Could not read this image. Try a smaller area.'):extracted?.ocr==='done'?l('选区内没有识别出文字。','No text was recognized in the selected image.'):l('此处没有可提取的页面文字。','No page text found in this area.'))}/>}</label>
        {extracted&&<small role="status">{extracted.ocr?l('识别对象为已合成的选区，不读取马赛克下的原图。','Reads the marked selection, not the pixels hidden below the mosaic.'):l('基于网站正文，不识别照片内的文字。','Uses the website text, not OCR of photographs.')}</small>}
        <div><button type="button" onClick={dismissPopup}>{l('关闭','Close')}</button>
          {input?<button type="button" className="sme-done" data-action="insert-text" disabled={!input.value.trim()} onClick={putText}>{l('插入文字','Insert text')}</button>:
            <button type="button" disabled={!extracted?.value} onClick={async()=>{try{await navigator.clipboard.writeText(extracted!.value);setMsg(l('文字已复制。','Text copied.'));setExtracted(null)}catch{dialog.current?.querySelector('textarea')?.select()}}}>{l('复制文字','Copy text')}</button>}</div>
      </section></div>}
    </div>
  </dialog>,document.body)
}
