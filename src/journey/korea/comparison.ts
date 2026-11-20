/**
 * Typed comparison hook between Chapter I (Warring States) and this chapter (1950–1953).
 *
 * This module is data only. It has no runtime import of force modules, so a later
 * merger can wire a comparison UI without creating a circular dependency.
 *
 * Chapter I concept labels are duplicated from `src/journey/force/content.ts`
 * (institutions, weapons / bronze lock, military writings, Changping caution,
 * and the line that strategy is a craft of the state). Keep the wording in
 * sync by hand if that file is edited.
 */
import type { Localized } from '../types'

export type ComparisonAxis = 'intensity' | 'mobilization' | 'equipment' | 'strategy'

export type ComparisonSide = {
  chapterId: 'force' | 'korea'
  period: Localized
  concepts: readonly Localized[]
  caution: Localized
}

export type ComparisonHook = {
  axis: ComparisonAxis
  title: Localized
  prompt: Localized
  chapterI: ComparisonSide
  korea: ComparisonSide
}

const CHAPTER_I_PERIOD: Localized = {
  en: 'Chapter I  ·  Warring States, c. 475–221 BCE',
  zh: '第一章  ·  战国，约前475–前221年',
}

const KOREA_PERIOD: Localized = {
  en: 'This chapter  ·  the War to Resist US Aggression and Aid Korea, 1950–1953',
  zh: '本章  ·  抗美援朝，1950–1953年',
}

export const COMPARISON_HOOKS: readonly ComparisonHook[] = [
  {
    axis: 'intensity',
    title: { en: 'Intensity', zh: '烈度' },
    prompt: {
      en: 'Compare how long war could be sustained, and what kind of war it was, not who can produce the larger unverified total.',
      zh: '比较战争能持续多久、是怎样一种战争，而不是谁能报出更大的、未经核对的数字。',
    },
    chapterI: {
      chapterId: 'force',
      period: CHAPTER_I_PERIOD,
      concepts: [
        { en: 'Almost continuous interstate war for more than two centuries.', zh: '列国之间几乎连续打了两个多世纪。' },
        { en: 'Defeat could mean the end of a state, not merely a treaty and a journey home.', zh: '战败往往不是签一份和约就回家，而是可能亡国。' },
        { en: 'Huge army figures in the sources are claims, not musters.', zh: '文献中的大兵力数字是记载，不是名册。' },
      ],
      caution: {
        en: 'Duration and the cost of defeat are the safer measures of intensity in this period.',
        zh: '在这个时期，持续时间和失败的代价，是更稳妥的烈度尺度。',
      },
    },
    korea: {
      chapterId: 'korea',
      period: KOREA_PERIOD,
      concepts: [
        { en: 'A narrow peninsula, three continuous years of high-intensity modern war.', zh: '一条狭窄的半岛，连续三年的高强度现代化战争。' },
        { en: 'Jets, artillery, landings and interdiction appear together on one short theater.', zh: '喷气式飞机、大炮、登陆与空中遮断，同时出现在一条短战线上。' },
        { en: 'The armistice of 1953 halted the fighting; it was not a peace treaty.', zh: '一九五三年的停战停止了交火，但并不是和平条约。' },
      ],
      caution: {
        en: 'Do not turn intensity into a display of death totals. The globe shows typological process only.',
        zh: '不要把烈度做成伤亡数字的展示。地球上只演示类型学过程。',
      },
    },
  },
  {
    axis: 'mobilization',
    title: { en: 'Mobilization', zh: '动员' },
    prompt: {
      en: 'Compare the machine of the state before comparing headcounts.',
      zh: '比人头之前，先比较国家这部机器。',
    },
    chapterI: {
      chapterId: 'force',
      period: CHAPTER_I_PERIOD,
      concepts: [
        // Duplicated from src/journey/force/content.ts (institutions beat).
        { en: 'Household registers.', zh: '户籍。' },
        { en: 'Granaries.', zh: '粮仓。' },
        { en: 'County administration, and repeated levy of people and grain.', zh: '县制，以及可反复征发的人与粮食。' },
      ],
      caution: {
        en: 'The Warring States fiscal-military state is the subject, not a reconstructed muster roll.',
        zh: '这里讨论的是战国财政-军事国家，不是一份复原出来的名册。',
      },
    },
    korea: {
      chapterId: 'korea',
      period: KOREA_PERIOD,
      concepts: [
        { en: 'A newly founded state sending the People’s Volunteer Army across the Yalu.', zh: '一个新成立的国家派出中国人民志愿军跨过鸭绿江。' },
        { en: 'Nationwide mobilization under the slogan “Resist US Aggression and Aid Korea; defend the homeland.”', zh: '在“抗美援朝，保家卫国”口号下的全国动员。' },
        { en: 'A long supply line kept open under air attack; donation campaigns and medical teams.', zh: '在空袭下尽量维持的漫长运输线，以及捐献与医疗队。' },
      ],
      caution: {
        en: 'Modern mobilization is shown typologically. Headcounts are not invented, and no single official tally is treated as a verified roll.',
        zh: '现代动员只作类型学展示。不编造人数，也不把某一份官方统计当成已经核对过的名册。',
      },
    },
  },
  {
    axis: 'equipment',
    title: { en: 'Equipment', zh: '装备' },
    prompt: {
      en: 'Compare how armies were armed, and under what industrial conditions, not a contest of magical weapons.',
      zh: '比较军队如何被武装、处在怎样的工业条件下，而不是神兵对决。',
    },
    chapterI: {
      chapterId: 'force',
      period: CHAPTER_I_PERIOD,
      concepts: [
        // Duplicated from src/journey/force/content.ts (weapons beat): bronze trigger lock, mass arming, iron.
        { en: 'The bronze trigger lock of the crossbow, a craft that could arm many without a lifetime of bow training.', zh: '弩的青铜机括：一种不必依赖长年射艺、也能把许多人武装起来的工艺。' },
        { en: 'A war economy that could put serviceable iron into many hands.', zh: '能把可用铁器交到许多人手里的战争经济。' },
        { en: 'Typological weapons, not a named excavated object.', zh: '类型学兵器，不是某一件有名的出土器。' },
      ],
      caution: {
        en: 'The best evidence for a high degree of standardization is Qin and Han; the Warring States are the formative period of that craft.',
        zh: '高度标准化的最佳证据在秦、汉；战国是它的形成期。',
      },
    },
    korea: {
      chapterId: 'korea',
      period: KOREA_PERIOD,
      concepts: [
        { en: 'Early Volunteer Army as light infantry, against UN superiority in air power, armor, and artillery.', zh: '战争初期志愿军以轻装步兵为主，面对联合国军在空军、坦克与大炮上的优势。' },
        { en: 'Later MiG-15s and the typological “MiG Alley” along the Yalu.', zh: '后来的米格十五，以及鸭绿江一带类型学意义上的“米格走廊”。' },
        { en: 'A ground supply line that was cut and repaired under air interdiction, but not broken for good.', zh: '在空中封锁下被切断又被抢修、却没有彻底中断的地面补给线。' },
      ],
      caution: {
        en: 'Equipment on the globe is typological, not a museum scan of a particular aircraft, gun, or truck.',
        zh: '地球上的装备是类型学示意，不是某一架飞机、一门炮或一辆车的博物馆扫描件。',
      },
    },
  },
  {
    axis: 'strategy',
    title: { en: 'Strategy', zh: '谋略' },
    prompt: {
      en: 'Compare strategy as a method of the state, including its cautions.',
      zh: '把谋略当作一种国家方法来比较，也包括它的审慎。',
    },
    chapterI: {
      chapterId: 'force',
      period: CHAPTER_I_PERIOD,
      concepts: [
        // Duplicated from src/journey/force/content.ts: military books, far/near, Changping caution, “strategy is a craft of the state.”
        { en: 'Military writing as a method, not only as a legend of clever captains.', zh: '兵书把谋略写成方法，而不只是名将传奇。' },
        { en: 'Schematic “befriend the distant, attack the near.”', zh: '“远交近攻”的示意。' },
        { en: 'The Changping caution: a major campaign in the record, whose famous totals are not to be visualized as fact.', zh: '长平的审慎：文献中的重大战役，其著名数字不可当成事实来可视化。' },
        { en: 'Strategy is a craft of the state.', zh: '谋略是一种国家技艺。' },
      ],
      caution: {
        en: 'The received military canon is not back-dated as a Warring States institution.',
        zh: '后世编成的武经，不在此提前写成战国制度。',
      },
    },
    korea: {
      chapterId: 'korea',
      period: KOREA_PERIOD,
      concepts: [
        { en: 'Concealment and the shock of first contact in the first campaign.', zh: '第一次战役中的隐蔽，以及初次接触带来的冲击。' },
        { en: 'Incheon as MacArthur’s operational surprise.', zh: '仁川作为麦克阿瑟的战役突然性。' },
        { en: 'After the fifth campaign, the policy of fighting while talking (边打边谈).', zh: '第五次战役之后，转向边打边谈。' },
        { en: 'Strategy again as a state decision: when to fight, when to talk, and how to sustain a campaign under equipment asymmetry.', zh: '谋略再次作为国家决策：何时打，何时谈，怎样在装备不对称的条件下把战役坚持下去。' },
      ],
      caution: {
        en: 'An armistice is not a mythical total victory, and not a surrender. Leave the comparison as an interface, not a score.',
        zh: '停战不是神话里的全胜，也不是投降。比较应作为接口留下，而不是打分。',
      },
    },
  },
] as const

export function comparisonHookFor(axis: ComparisonAxis): ComparisonHook {
  const hook = COMPARISON_HOOKS.find((item) => item.axis === axis)
  if (!hook) throw new Error(`Unknown comparison axis: ${axis}`)
  return hook
}

export const COMPARISON_INTERFACE = {
  version: 1 as const,
  ready: true,
  implementedUi: false,
  axes: ['intensity', 'mobilization', 'equipment', 'strategy'] as const satisfies readonly ComparisonAxis[],
  hooks: COMPARISON_HOOKS,
}
