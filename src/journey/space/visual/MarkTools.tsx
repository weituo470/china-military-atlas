import type { Tool } from './markDrawing'
export const toolsList:Tool[]=['crop','pan','move','rect','ellipse','arrow','pen','mosaic','text','number','emoji']
export const toolNames:Record<Tool,[string,string]>={crop:['框选','Crop'],pan:['平移视图','Pan view'],move:['移动标记','Move mark'],rect:['矩形','Rectangle'],ellipse:['椭圆','Ellipse'],arrow:['箭头','Arrow'],pen:['画笔','Pen'],mosaic:['马赛克','Mosaic'],text:['文字','Text'],number:['序号','Number'],emoji:['表情','Emoji']}
const paths={
 crop:'M5 2v16a1 1 0 001 1h16M2 5h16a1 1 0 011 1v16',
 move:'M12 2v20M2 12h20M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4m12-8l4 4-4 4',
 pan:'M8 12V5a1.5 1.5 0 013 0v6-7a1.5 1.5 0 013 0v7-6a1.5 1.5 0 013 0v7-3a1.5 1.5 0 013 0v6q0 7-6 7h-2q-3 0-5-3l-4-6q-1-2 1-3l4 4',
 rect:'M3 5h18v14H3z',ellipse:'M21.5 12a9.5 7.5 0 11-19 0 9.5 7.5 0 0119 0z',arrow:'M4 20L20 4m-11 0h11v11',
 pen:'M4 16L17 3l4 4L8 20l-6 2zM14 6l4 4',mosaic:'M3 3h18v18H3zM9 3v18m6-18v18M3 9h18M3 15h18',
 text:'M4 7V4h16v3m-8-3v16m-5 0h10',number:'M21 12a9 9 0 11-18 0 9 9 0 0118 0zM10 10l3-2v9m-3 0h6',
 emoji:'M21 12a9 9 0 11-18 0 9 9 0 0118 0zM8 14q4 5 8 0M8.5 9h.3m6.4 0h.3',
 undo:'M8 3L3 8l5 5M4 8h10a6 6 0 010 12h-4',redo:'M16 3l5 5-5 5m4-5H10a6 6 0 000 12h4',
 save:'M12 2v13m-5-5l5 5 5-5M4 15v6h16v-6',copy:'M8 8h13v13H8zM4 16H3V3h13v1',
 share:'M4 13v7h16v-7M12 15V3m-5 5l5-5 5 5',done:'M3 12l6 6L21 5',cancel:'M5 5l14 14M19 5L5 19',
 reset:'M4 10a8 8 0 111 7M4 3v7h7',delete:'M3 6h18M8 6V3h8v3m-11 1l1 14h12l1-14m-9 3v8m4-8v8',
 zoom:'M15 15l6 6M17 10a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6m-3-3v6',
 inspect:'M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5M7 9h10m-10 5h8',ocr:'M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5m5-1l3-7h2l3 7m-7-2h6',
 translate:'M2 5h11M7 2v3m4 0c0 5-3 8-8 10m1-7c1 3 3 5 6 6M12 21l4-11h2l4 11m-8-4h6',
 more:'M4 12h1m6 0h1m6 0h1'
}
export type IconName=keyof typeof paths
export function MarkIcon({name}:{name:IconName}){
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" aria-hidden="true"><path d={paths[name]} /></svg>
}
