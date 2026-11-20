import type { AtlasId } from './catalog'
const twins='https://english.news.cn/20241031/50fbbabe265f4d9f88ce4cb8412fc3e8/c.html'
const amphibs='https://eng.chinamil.com.cn/MEDIA/PhotosChina/16277487.html'
const cv='https://www.cnatra.navy.mil/local/docs/naval-aviation-vision.pdf'
// Original geometry; these are links to the public appearance references,
// not copies of photographs, present-day locations, or fleet total sources.
export const photoSources:Record<AtlasId,string>={
  liaoning:twins,shandong:'https://english.news.cn/20250703/1a0c9fb588e642ae91c45abfd873942f/c.html',
  fujian:'https://english.news.cn/20251107/a61224516aea4fb895a65861fcf26cfd/c.html',
  type055:'https://eng.chinamil.com.cn/BILINGUAL/Photos_209204/16352325_2.html',type071:amphibs,type075:amphibs,
  nimitz:cv,ford:cv,izumo:'https://www.mod.go.jp/j/press/wp/wp2022/html/nc020000.html',
  kaga:'https://www.navy.mil/Press-Office/News-Stories/display-news/Article/3940484/f-35b-test-jet-begins-sea-trials-with-japanese-multi-functional-destroyer-in-ea/',
  sejong:'https://www.dvidshub.net/image/1821867/foal-eagle-2015',
  udaloy:'https://commons.wikimedia.org/wiki/File:AdmiralVinogradov1989.jpg',
  hobart:'https://www.navy.gov.au/capabilities/ships-boats-and-submarines/hmas-hobart-iii',
  anzac:'https://seapower.navy.gov.au/sites/default/files/2025-02/Anzac%20III.pdf',
  collins:'https://www.navy.gov.au/capabilities/ships-boats-and-submarines/hmas-collins',
}

