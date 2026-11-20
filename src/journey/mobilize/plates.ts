import { ARCHIVE_ART } from '../../publicEdition'
import type { Localized } from '../types'

export type MobilizePlate = {
  src: string
  alt: Localized
  caption: Localized
}

export const MOBILIZE_PLATES: Record<string, MobilizePlate> = {
  hook: {
    src: `${import.meta.env.BASE_URL}art/mobilize/hook.webp`,
    alt: {
      en: 'Typological plate of the three axes of this chapter: plans and institutions, projection and engineering, and social mobilization. A historical imagination, not a photograph.',
      zh: '本章三条轴的类型学图版：预案与体制、投送与工程、社会动员。类型学想象图，并非照片。',
    },
    caption: {
      en: 'Plans, engineering and people: three ways to read the response.',
      zh: '预案、工程和人：本章观察动员的三个角度。',
    },
  },
  system: {
    src: `${import.meta.env.BASE_URL}art/mobilize/system.webp`,
    alt: {
      en: 'Typological diagram of the emergency-management system around the Ministry of Emergency Management, plans, a four-level response, fire-and-rescue teams, and defense mobilization.',
      zh: '以应急管理部为中心的应急体制类型学图：预案、四级响应、消防救援队伍与国防动员。',
    },
    caption: {
      en: 'Institutions, contingency plans and the teams that put them into practice.',
      zh: '应急管理、应急预案与承担救援的力量。',
    },
  },
  floods: {
    src: `${import.meta.env.BASE_URL}art/mobilize/floods.webp`,
    alt: {
      en: 'Typological diagram of the mid-Yangtze defense line in 1998, from the later Three Gorges works through the Jingjiang reach to Wuhan and Jiujiang.',
      zh: '一九九八年长江中游防线类型学图：从后来的三峡工程，经荆江河段，到武汉与九江。',
    },
    caption: {
      en: 'Dike defense and evacuation. The dam shown was built later; it was not operating in 1998.',
      zh: '守堤与转移示意。图中的三峡大坝为后来所建，1998 年尚未投入防洪运行。',
    },
  },
  wenchuan: {
    src: `${import.meta.env.BASE_URL}art/mobilize/wenchuan.webp`,
    alt: {
      en: 'Typological diagram of projection into Yingxiu and of counterpart reconstruction arrows toward Sichuan.',
      zh: '向映秀投送、以及通向四川的对口援建箭头的类型学图。',
    },
    caption: {
      en: 'Arrows show pairings. 2008 plan: 19 partners across Sichuan, Gansu and Shaanxi. 2018 retrospective: 18 partners for Sichuan.',
      zh: '箭头示意援建方向。2008 年方案：19 省市支援川甘陕；2018 年回顾：18 省市援川。',
    },
  },
  epidemic: {
    src: `${import.meta.env.BASE_URL}art/mobilize/epidemic.webp`,
    alt: {
      en: 'Ink illustration of emergency hospital construction, prefabricated units, arriving medical teams and a converted public hall.',
      zh: '应急医院建设、预制构件、医疗队车辆和改造为方舱的场馆的水墨示意。',
    },
    caption: {
      en: 'Emergency hospitals and converted public venues. This is not a site photograph.',
      zh: '应急医院建设与公共场馆改造，不是工地照片。',
    },
  },
  warning: {
    src: `${import.meta.env.BASE_URL}art/mobilize/warning.webp`,
    alt: {
      en: 'Typological net of meteorological and earthquake warning, professional rescue, aviation rescue, and central stockpiles.',
      zh: '气象与地震预警、专业救援、航空救援和中央储备的类型学网络。',
    },
    caption: {
      en: 'Alerts, standing rescue teams, air support and stockpiles.',
      zh: '预警、常备救援、航空救援与救灾储备。',
    },
  },
  rebuild: {
    src: `${import.meta.env.BASE_URL}art/mobilize/rebuild.webp`,
    alt: {
      en: 'Typological sequence from temporary shelter, through the restoration of lifelines, to counterpart reconstruction.',
      zh: '从临时安置，经生命线抢通，到对口援建的类型学顺序。',
    },
    caption: {
      en: 'From temporary shelter through restoring lifelines to rebuilding towns.',
      zh: '从临时安置、生命线抢通，到城镇重建。',
    },
  },
  close: {
    src: `${import.meta.env.BASE_URL}art/mobilize/close.webp`,
    alt: {
      en: 'Typological plate of the merge interfaces with the Warring States, Korea, and 2026 baseline chapters.',
      zh: '与战国、抗美援朝、二〇二六军力基线三章接口的类型学图版。',
    },
    caption: {
      en: 'Three chapters for comparison: Warring States, Korea and the 2026 military baseline.',
      zh: '三条可对照阅读的线索：战国、抗美援朝与 2026 军力基线。',
    },
  },
}

export function preloadMobilizePlates() {
  if (!ARCHIVE_ART) return
  Object.values(MOBILIZE_PLATES).forEach((plate) => {
    const image = new Image()
    image.src = plate.src
  })
}
