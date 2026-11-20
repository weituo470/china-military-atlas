import { useId, type ReactNode } from 'react'
import { phrase, t, type IndustryLanguage, type IndustryText } from './locale'

import { categoryGroups } from './atlas/classification'
export { INDUSTRY_CLASSIFICATION_URL } from './atlas/classification'

type Glyph = 'aircraft' | 'ship' | 'plant' | 'dock' | 'rail' | 'grid' | 'satellite' | 'chip' | 'cargo' | 'truck'

/* Pictograms only: generic forms, no engineering dimensions or real equipment classes. */
const glyphs: Record<Glyph, ReactNode> = {
  aircraft: <>
    <path d="M5 43 Q13 34 32 33L56 32 85 14H98L86 34H135L151 20H160L156 41 176 45V49H124L92 62H80L91 49H22Q9 48 5 43Z" />
    <path d="M21 37l11 5h16l-7-7M32 46h132M113 49l-13 7M144 31h12" opacity=".65" />
  </>,
  ship: <>
    <path d="M4 49h142l29-9-13 21-10 5H14Z M28 49V36h81l16 13M64 36l8-14h29l12 14M84 22V10h7v12M78 15h18" />
    <path d="M11 57h153M36 41h18m9 0h18m9 0h18m-31-13h19M25 70h127" opacity=".65" />
  </>,
  cargo: <>
    <path d="M5 50h151l19-8-13 20-12 5H16ZM20 50V22h27l8 28m-31-28v-8h15v8M57 50V38h90v12m-85-12V27h75v11" />
    <path d="M11 58h151M25 30h19m-19 6h23m23-9v23m15-23v23m15-23v23m15-23v23m15-23v23M12 73h150" opacity=".65" />
  </>,
  truck: <>
    <path d="M13 20h108v39H13Zm108 13h29l20 17v14h-22m-27-5h10m-108 0v5h14m20 0h72M134 39h13l11 10h-24Z" />
    <path d="M25 25v26m13-26v26m13-26v26m13-26v26m13-26v26m13-26v26m13-26v26M13 74h157" opacity=".55" />
    <circle cx="47" cy="65" r="8" /><circle cx="139" cy="65" r="8" />
  </>,
  plant: <>
    <path d="M14 66V36l31-17v17l31-17v17l32-17v47H14Zm94-29h27V16h12v50h-39M14 71h143M21 52h80M30 53v13m20-13v13m20-13v13m20-13v13m44-42h13" />
    <path d="M22 41h77m16 7h19m-19 8h19" opacity=".55" />
  </>,
  dock: <>
    <path d="M19 18h142v8H19Zm10 8v41m7-41v41m108-41v41m7-41v41M10 66h41v10h78V66h41M47 60h82l-11 11H60Zm31-34v17q0 10 9 6" />
    <path d="M32 35l21-9m94 9-21-9M56 55h72M13 71h28m98 0h27m-97 1h41" opacity=".55" />
  </>,
  rail: <>
    <path d="M12 28h54v30H12Zm59 0h56v30H71Zm61 13h16V27h18l10 18v13h-44ZM66 53h5m56 0h5M9 68h169M17 73h153m-119-5v5m37-5v5m37-5v5m37-5v5" />
    <path d="M20 32v21m11-21v21m11-21v21m11-21v21m27-21v21m11-21v21m11-21v21m11-21v21m45-20h7l5 9h-12Z" opacity=".55" />
    {[22, 54, 82, 117, 145, 167].map((x) => <circle key={x} cx={x} cy="62" r="4" />)}
  </>,
  grid: <>
    <path d="M22 70 44 10h8l22 60M30 25h36m-40 14h44m-36 0 31 31M62 39 30 70m10-45 16 14m0-14L40 39M113 70l14-43h6l15 43m-31-33h28m-30 12h33m-21 0 16 21m-10-21-15 21M13 70h151" />
    <path d="M66 25q32 19 51 12m-47 2q23 16 45 10m33 0 23 7" opacity=".72" />
  </>,
  satellite: <>
    <path d="M73 28h34v30H73Zm-51 4h41v22H22Zm95 0h41v22h-41ZM63 43h10m34 0h10M34 32v22m16-22v22m79-22v22m15-22v22M22 43h41m54 0h41M90 28V17M76 17q14-18 28 0Zm6 41v11h16V58" />
    <path d="M77 37h24m-24 12h24" opacity=".55" />
  </>,
  chip: <>
    <rect x="61" y="13" width="58" height="58" rx="3" />
    <path d="M74 27h32v30H74ZM80 33h20v18H80Z" opacity=".55" />
    {[70, 80, 90, 100, 110].map((x, i) => <path key={x} d={`M${x} 13V6m0 65v7M61 ${22 + i * 10}h-9m67 0h9`} />)}
  </>,
}

function Profile({ name, x, y, scale = 1 }: { name: Glyph; x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke="#203d53" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      {glyphs[name]}
    </g>
  )
}

function Drawing({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <svg className="industry-svg industry-vector" viewBox="0 0 800 450" role="img" aria-label={title}>
      <defs>
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#dfe7ec" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="800" height="450" fill="#f6f8f9" />
      <rect x="18" y="18" width="764" height="414" fill={`url(#${id})`} stroke="#aabac6" />
      <path d="M18 32V18h14m736 0h14v14m0 386v14h-14m-736 0H18v-14" fill="none" stroke="#203d53" strokeWidth="2" />
      {children}
    </svg>
  )
}

function Ink({ children, x, y, size = 20, anchor = 'start', strong = false }: {
  children: ReactNode; x: number; y: number; size?: number; anchor?: 'start' | 'middle' | 'end'; strong?: boolean
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={strong ? 680 : 500} fill={strong ? '#183248' : '#37556b'}>
      {children}
    </text>
  )
}

const label = (zh: string, en: string, ja: string): IndustryText => ({ zh, en, ja })
const supports: { glyph: Glyph; name: IndustryText; function: IndustryText }[] = [
  { glyph: 'plant', name: label('厂房', 'Factory', "工場"), function: label('制造与备件', 'Build & make spares', "製造・部品供給") },
  { glyph: 'dock', name: label('船坞', 'Dry dock', "ドック"), function: label('定检与维修', 'Inspect & repair', "点検・修理") },
  { glyph: 'rail', name: label('铁路', 'Railway', "鉄道"), function: label('转运与补给', 'Move & resupply', "輸送・補給") },
  { glyph: 'grid', name: label('电网', 'Power grid', "送電網"), function: label('持续供电', 'Supply power', "電力供給") },
]

export function ChassisLayersPlate({ language }: { language: IndustryLanguage }) {
  const l = (d: IndustryText) => t(d, language)
  return (
    <Drawing title={phrase(language, '装备与工业底盘：舰船与飞机在上，厂房、船坞、铁路、电网在下。连线表示支撑关系。', 'Industrial foundations support ships and aircraft: factories, dry docks, railways and power grids.', "装備と産業の土台。上段に艦船と航空機、下段に工場、ドック、鉄道、送電網。線は装備を支える関係を示します。")}>
      <rect x="34" y="34" width="732" height="150" fill="#fff" fillOpacity=".8" stroke="#9eafbc" />
      <path d="M400 67v105" stroke="#b6c5cf" strokeDasharray="4 5" />
      <Ink x={51} y={61} strong>{phrase(language, '看得见的装备', 'Visible equipment', "目に見える装備")}</Ink>
      <Profile name="ship" x={118} y={69} scale={1.12} />
      <Profile name="aircraft" x={481} y={69} scale={1.12} />
      <Ink x={218} y={170} size={18} anchor="middle">{phrase(language, '舰船', 'Ship', "艦船")}</Ink>
      <Ink x={581} y={170} size={18} anchor="middle">{phrase(language, '飞机', 'Aircraft', "航空機")}</Ink>
      <path d="M218 200v-16m363 16v-16m-5 6 5-6 5 6m-373 0 5-6 5 6M400 260v-35M124 270v-10h552v10m-368 0v-10m184 10v-10" fill="none" stroke="#385c75" strokeWidth="2" />
      <rect x="34" y="200" width="732" height="25" fill="#e2ebf1" stroke="#9eafbc" />
      <Ink x={400} y={219} size={17} anchor="middle" strong>
        {phrase(language, '制造　／　运输　／　维修　／　供能', 'Build   /   Move   /   Repair   /   Power', "製造　／　輸送　／　修理　／　エネルギー供給")}
      </Ink>
      <Ink x={51} y={250} strong>{phrase(language, '工业底盘', 'Industrial foundation', "産業の土台")}</Ink>
      {supports.map(({ glyph, name, function: job }, i) => {
        const x = 34 + i * 184
        return (
          <g key={glyph}>
            <rect x={x} y="270" width="180" height="146" fill="#eaf0f4" stroke="#9eafbc" />
            <Profile name={glyph} x={x + 15} y={286} scale={.83} />
            <path d={`M${x + 13} 357h154`} stroke="#9eafbc" />
            <Ink x={x + 90} y={381} anchor="middle" strong>{l(name)}</Ink>
            <Ink x={x + 90} y={402} anchor="middle" size={16}>{l(job)}</Ink>
          </g>
        )
      })}
    </Drawing>
  )
}

const positionedGroups = categoryGroups.map((group, i) => ({ ...group, y: [80, 138, 370][i] }))

export function CategoriesPlate({ language }: { language: IndustryLanguage }) {
  return (
    <Drawing title={phrase(language, '41 个工业大类：采矿业 06 至 12，制造业 13 至 43，电热气水供应 44 至 46。', '41 major industrial categories: mining codes 06–12, manufacturing 13–43, utilities 44–46.', "工業41大分類：鉱業は06〜12、製造業は13〜43、電力・熱・ガス・水供給は44〜46。")}>
      <Ink x={36} y={56} size={27} strong>{phrase(language, '41 个工业大类', '41 industrial categories', "工業41大分類")}</Ink>
      <Ink x={764} y={54} size={16} anchor="end">GB/T 4754—2017</Ink>
      <path d="M36 65h728M36 128h728m-728 231h728" fill="none" stroke="#aabac6" />
      {positionedGroups.map(({ section, name, range: [first, last], y }) => (
        <g key={section}>
          <Ink x={36} y={y + 20} strong>{section} / {t(name, language)}</Ink>
          <Ink x={36} y={y + 41} size={16}>{last - first + 1} {phrase(language, '个大类', 'categories', "分類")}</Ink>
          {Array.from({ length: last - first + 1 }, (_, i) => {
            const x = 212 + (i % 8) * 70
            const cy = y + Math.floor(i / 8) * 53
            const code = String(first + i).padStart(2, '0')
            return (
              <g key={code} data-industry-code={code}>
                <rect x={x} y={cy} width="62" height="44" fill={section === 'C' ? '#fff' : '#e7eff4'} stroke="#9eafbc" />
                <Ink x={x + 31} y={cy + 29} anchor="middle" size={23} strong>{code}</Ink>
              </g>
            )
          })}
        </g>
      ))}
    </Drawing>
  )
}

const sectors: { glyph: Glyph; name: IndustryText; example: IndustryText }[] = [
  { glyph: 'aircraft', name: label('航空', 'Aviation', "航空"), example: label('飞机', 'Aircraft', "航空機") },
  { glyph: 'satellite', name: label('航天', 'Space', "宇宙"), example: label('卫星', 'Satellite', "人工衛星") },
  { glyph: 'chip', name: label('电子', 'Electronics', "電子"), example: label('芯片', 'Chip', "半導体") },
  { glyph: 'grid', name: label('能源', 'Energy', "エネルギー"), example: label('输电设施', 'Power grid', "送電網") },
  { glyph: 'rail', name: label('交通', 'Transport', "交通"), example: label('铁路货运', 'Freight rail', "鉄道貨物") },
]

export function SectorIconsPlate({ language }: { language: IndustryLanguage }) {
  return (
    <Drawing title={phrase(language, '行业图例：航空、航天、电子、能源、交通。', 'Sector examples: aviation, space, electronics, energy and transport.', "産業の例：航空、宇宙、電子、エネルギー、交通。")}>
      <Ink x={38} y={56} size={25} strong>{phrase(language, '行业图例', 'Sector examples', "産業の例")}</Ink>
      <path d="M38 68h724" stroke="#aabac6" />
      {sectors.map(({ glyph, name, example }, i) => {
        const x = i < 3 ? 38 + i * 244 : 38 + (i - 3) * 368
        const y = i < 3 ? 80 : 250
        const width = i < 3 ? 236 : 356
        const cx = x + width / 2
        return (
          <g key={glyph}>
            <rect x={x} y={y} width={width} height="156" fill="#fff" stroke="#9eafbc" />
            <path d={`M${x + 12} ${y + 96}h${width - 24}`} fill="none" stroke="#aabac6" />
            <Profile name={glyph} x={cx - 90} y={y + 12} />
            <Ink x={cx} y={y + 123} anchor="middle" strong>{t(name, language)}</Ink>
            <Ink x={cx} y={y + 145} anchor="middle" size={16}>{t(example, language)}</Ink>
          </g>
        )
      })}
    </Drawing>
  )
}

export function NetworkPlate({ language }: { language: IndustryLanguage }) {
  const nodes = [
    { x: 42, y: 92, title: label('材料', 'Materials', "材料") },
    { x: 42, y: 215, title: label('能源', 'Energy', "エネルギー") },
    { x: 42, y: 338, title: label('电子', 'Electronics', "電子") },
    { x: 316, y: 92, title: label('加工', 'Fabrication', "加工") },
    { x: 316, y: 338, title: label('配套', 'Components', "部品供給") },
    { x: 590, y: 215, title: label('总装', 'Final assembly', "最終組立") },
  ]
  return (
    <Drawing title={phrase(language, '抽象行业网络：供给链断开与替代路径，不表示真实供应关系。', 'Abstract industry network: a break and an alternate path, not real supply ties.', "抽象的な産業網。供給の途切れと代替経路を示します。実際の供給関係ではありません。")}>
      <Ink x={42} y={56} size={25} strong>{phrase(language, '行业协作网络', 'Industry network', "産業の協力網")}</Ink>
      <path d="M42 66h716M210 121h106m-106 123h48V121m-48 246h106m-106-123h48v123M484 121h44v89m0 38h62" fill="none" stroke="#8aa0b0" strokeWidth="2" />
      <path d="M484 367h45V263h61" fill="none" stroke="#203d53" strokeWidth="3" strokeDasharray="8 6" />
      <path d="m519 220 18 18m0-18-18 18" stroke="#203d53" strokeWidth="2.5" />
      <Ink x={544} y={223} size={17}>{phrase(language, '缺环', 'Break', "途切れ")}</Ink>
      <Ink x={548} y={350} size={17}>{phrase(language, '替代路径', 'Alternate path', "代替経路")}</Ink>
      {nodes.map(({ x, y, title }) => (
        <g key={title.en}>
          <rect x={x} y={y} width="168" height="58" fill={title.en === 'Final assembly' ? '#e4edf3' : '#fff'} stroke="#55768e" />
          <Ink x={x + 84} y={y + 37} anchor="middle" strong>{t(title, language)}</Ink>
        </g>
      ))}
    </Drawing>
  )
}

const modes: { glyph: Glyph; name: IndustryText; example: IndustryText }[] = [
  { glyph: 'cargo', name: label('水运', 'Water', "水運"), example: label('商船', 'Merchant ship', "商船") },
  { glyph: 'rail', name: label('铁路', 'Rail', "鉄道"), example: label('货运列车', 'Freight train', "貨物列車") },
  { glyph: 'truck', name: label('公路', 'Road', "道路"), example: label('货车', 'Truck', "トラック") },
]

export function LawTransportPlate({ language }: { language: IndustryLanguage }) {
  return (
    <Drawing title={phrase(language, '民用运输示意：商船、货运列车与货车。', 'Civilian transport: merchant ship, freight train and truck.', "民間輸送の模式図。商船、貨物列車、トラック。")}>
      <Ink x={38} y={64} size={27} strong>{phrase(language, '民用运输', 'Civilian transport', "民間輸送")}</Ink>
      <path d="M38 79h724" stroke="#aabac6" />
      {modes.map(({ glyph, name, example }, i) => {
        const x = 38 + i * 244
        return (
          <g key={glyph}>
            <rect x={x} y="104" width="236" height="246" fill="#fff" stroke="#9eafbc" />
            <Ink x={x + 118} y={149} size={23} anchor="middle" strong>{t(name, language)}</Ink>
            <Profile name={glyph} x={x + 19} y={181} scale={1.1} />
            <path d={`M${x + 16} 287h204`} stroke="#aabac6" />
            <Ink x={x + 118} y={321} size={20} anchor="middle">{t(example, language)}</Ink>
          </g>
        )
      })}
      <path d="M38 380h724" stroke="#aabac6" />
      <Ink x={762} y={409} size={18} anchor="end">{phrase(language, '运载工具举例', 'Examples of civilian vehicles', "民間輸送手段の例")}</Ink>
    </Drawing>
  )
}
