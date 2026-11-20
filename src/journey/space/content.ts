import type { JourneyBeat, Localized } from '../types'

const pair = (zh: string, en: string): Localized => ({ zh, en })

export const SOURCES = {
  whitepaper: { agency: pair('国务院新闻办公室', 'State Council Information Office'), title: pair('《2021 中国的航天》白皮书', 'China’s Space Program: A 2021 Perspective'), url: 'https://www.cnsa.gov.cn/n6758823/n6758844/n6760320/n6760321/c6813117/content.html' },
  satellite: { agency: pair('国家航天局', 'China National Space Administration'), title: pair('中国第一颗人造卫星：东方红一号', 'Dong Fang Hong 1, China’s first satellite'), url: 'https://www.cnsa.gov.cn/n6758968/n6758972/c10004149/content.html' },
  launch: { agency: pair('国家航天局', 'China National Space Administration'), title: pair('嫦娥六号发射任务圆满成功', 'Successful launch of Chang’e 6'), url: 'https://www.cnsa.gov.cn/n6758823/n6758838/c10522320/content.html' },
  station: { agency: pair('中国载人航天工程办公室', 'China Manned Space Agency'), title: pair('空间站天和核心舱飞行任务新闻发布会', 'Tianhe core module mission briefing'), url: 'https://www.cmse.gov.cn/ztbd/xwfbh/202106/t20210622_48281.html' },
  stationT: { agency: pair('中国载人航天官方网站', 'China Manned Space Agency website'), title: pair('梦天实验舱转位与空间站 T 字构型', 'Mengtian relocation and the station’s T configuration'), url: 'https://www.cmse.gov.cn/fxrw/mengtian/mtjj/202211/t20221106_51269.html' },
  moon: { agency: pair('国家航天局', 'China National Space Administration'), title: pair('嫦娥六号实现世界首次月球背面采样返回', 'Chang’e 6 completes first lunar far-side sample return'), url: 'https://www.cnsa.gov.cn/n6758823/n6758844/n10518102/n10518147/c10565180/content.html' },
  relay: { agency: pair('国家航天局', 'China National Space Administration'), title: pair('嫦娥六号总设计师揭秘月球背面采样细节', 'Chang’e 6 chief designer on far-side sampling'), url: 'https://www.cnsa.gov.cn/n6758823/n6758844/n10518102/n10518157/c10570691/content.html' },
  beidou: { agency: pair('国务院公报', 'State Council Gazette'), title: pair('北斗三号全球卫星导航系统建成开通', 'Opening of the BeiDou-3 global navigation system'), url: 'https://www.gov.cn/gbgl/bfaa2149403144cd86aed4bd3fa94de6/files/ddcd526955f24122ab1570f3b62a8dd3.pdf' },
  fast: { agency: pair('中国科学院国家天文台', 'National Astronomical Observatories, CAS'), title: pair('500 米口径球面射电望远镜通过国家验收', 'FAST passes national acceptance review'), url: 'https://nao.cas.cn/news/gd/202001/t20200111_6407308.html' },
} satisfies Record<string, { agency: Localized; title: Localized; url: string }>

export type SpaceBeatId = 'opening' | 'dfh' | 'launch' | 'tiangong' | 'moon' | 'beidou' | 'fast' | 'closing'
type SpaceBeat = JourneyBeat & { id: SpaceBeatId; date: string; caption: Localized; sources: readonly (keyof typeof SOURCES)[] }

function beat(id: SpaceBeatId, name: Localized, kicker: Localized, date: string, title: Localized, body: Localized,
  caption: Localized, lines: readonly Localized[], sources: SpaceBeat['sources']): SpaceBeat {
  return { id, name, kicker, date, title, body, caption, narration: { zh: lines.map(l => l.zh), en: lines.map(l => l.en) }, sources }
}

export const BEATS = [
  beat('opening', pair('开场', 'Prologue'), pair('科研航天', 'Science & spaceflight'), '',
    pair('从地面到深空', 'From Earth to deep space'),
    pair('从第一颗卫星到月背样品，沿着一条航天任务链，看科研怎样变成国家能长期运用的能力。',
      'From the first satellite to samples from the far side of the Moon: how does research become a capability a nation can sustain?'),
    pair('地月空间', 'Earth–Moon space'), [
      pair('一次发射只有几分钟。但把东西送上去、让它工作，最后把数据甚至样品带回来，要靠许多人接力。',
        'A launch lasts only minutes. Getting something to space, keeping it working, and bringing back data or samples takes many teams working together.'),
      pair('中国的科研航天是怎么走到这一步的？我们从第一颗人造卫星说起。',
        'How did China build that capability? The story starts with its first satellite.'),
    ], ['whitepaper']),
  beat('dfh', pair('第一颗卫星', 'First satellite'), pair('独立入轨', 'Reaching orbit'), '1970.04.24',
    pair('让第一颗卫星开口', 'A signal from China’s first satellite'),
    pair('东方红一号从酒泉升空。中国第一次独立研制并发射人造卫星。',
      'Dong Fang Hong 1 lifted off from Jiuquan, becoming the first satellite China developed and launched independently.'),
    pair('东方红一号', 'Dong Fang Hong 1'), [
      pair('一九七零年四月二十四日，长征一号把东方红一号送入轨道。地面收到了它播送的《东方红》乐曲。',
        'On April 24, 1970, Long March 1 put Dong Fang Hong 1 into orbit. On the ground, receivers picked up the tune “The East Is Red.”'),
      pair('这个信号背后，卫星、火箭和地面测控第一次共同完成了中国的卫星发射任务。',
        'That signal marked the first time China’s satellite, rocket and ground tracking teams completed a satellite launch together.'),
    ], ['satellite']),
  beat('launch', pair('运载', 'Launch'), pair('文昌发射', 'Wenchang liftoff'), '2024.05.03',
    pair('奔月从海边开始', 'The road to the Moon starts at the coast'),
    pair('长征五号在文昌将嫦娥六号送入地月转移轨道。入轨只是探月任务的第一棒。',
      'At Wenchang, Long March 5 sent Chang’e 6 onto a trajectory toward the Moon. The launch was only the first leg of the mission.'),
    pair('长征五号运载火箭', 'Long March 5 launch vehicle'), [
      pair('二零二四年五月三日，嫦娥六号从海南文昌启程。负责第一段路的是长征五号运载火箭。',
        'On May 3, 2024, Chang’e 6 set off from Wenchang, Hainan. A Long March 5 rocket carried it on the first leg.'),
      pair('火箭要把探测器送到合适的轨道，后续的飞行才能接上。一场成功的发射，从研制、总装到发射场，少不了一次次联试。',
        'The rocket has to put the probe on the right trajectory for the rest of the flight to work. That takes repeated tests across design, integration and launch teams.'),
    ], ['launch', 'whitepaper']),
  beat('tiangong', pair('天宫', 'Tiangong'), pair('在轨实验', 'Science in orbit'), '2022.11',
    pair('在轨道上建一间实验室', 'Building a laboratory in orbit'),
    pair('天和、问天、梦天在轨组成 T 字构型。航天员能长期驻留，也能接力做实验。',
      'Tianhe, Wentian and Mengtian form a T-shaped station where rotating crews can live and run experiments.'),
    pair('天宫空间站三舱基本构型', 'Tiangong’s three-module configuration'), [
      pair('天和是核心舱。问天和梦天接到两侧，给实验留出空间。到二零二二年，三舱组成了天宫的基本构型。',
        'Tianhe is the core. Wentian and Mengtian attach on either side, making room for experiments. In 2022, the three modules formed Tiangong’s basic configuration.'),
      pair('地面很难长时间维持微重力。到了空间站，航天员可以在这种环境里做实验，换一批人还可以接着做。',
        'Sustaining microgravity on Earth is difficult. At the station, crews can run experiments in that environment and hand the work over to the next team.'),
    ], ['station', 'stationT']),
  beat('moon', pair('月背', 'Lunar far side'), pair('样品返回', 'Sample return'), '2024.06.25',
    pair('把月球背面带回地球', 'Bringing the Moon’s far side to Earth'),
    pair('嫦娥六号完成人类首次月背采样返回。鹊桥二号在地球与月背之间接力传信。',
      'Chang’e 6 made the first sample return from the lunar far side. Queqiao 2 relayed signals between Earth and the far side.'),
    pair('地球、月球与通信中继', 'Earth, the Moon and the relay'), [
      pair('月球挡住了背面通往地球的直线。鹊桥二号在太空中转发信号，地面才有办法跟月背的探测器通信。',
        'The Moon blocks the direct line from its far side to Earth. Queqiao 2 relayed signals so the ground team could talk to the probe.'),
      pair('二零二四年六月二十五日，装着月背样品的返回器在内蒙古着陆。探测器看见的地方，终于有了可以在地球实验室里亲手研究的样品。',
        'On June 25, 2024, the capsule carrying samples landed in Inner Mongolia. Scientists could finally study material from the lunar far side in laboratories on Earth.'),
    ], ['moon', 'relay']),
  beat('beidou', pair('北斗', 'BeiDou'), pair('空间基础设施', 'Space infrastructure'), '2020.07',
    pair('从太空给地面一把尺', 'A reference for place and time'),
    pair('北斗三号把卫星导航变成全球服务。它不仅告诉终端在哪儿，也为不同设备提供共同的时间基准。',
      'BeiDou-3 provides global satellite navigation. It helps devices work out where they are and gives them a shared time reference.'),
    pair('卫星导航原理示意，非实际星座分布', 'Satellite navigation concept, not an orbital map'), [
      pair('北斗三号在二零二零年建成开通。接收机用不同卫星发来的信号估算自己的位置，也能校准时间。',
        'BeiDou-3 opened for service in 2020. Receivers use signals from different satellites to estimate their location and synchronize time.'),
      pair('导航让救援队知道位置，授时让不同设备用同一个时钟。卫星只是看得见的一环，背后还有地面系统和日常运维。',
        'Navigation can help rescuers locate people; timing lets separate devices share a clock. Behind the satellites are ground systems and teams keeping the service running.'),
    ], ['beidou', 'whitepaper']),
  beat('fast', pair('天眼', 'FAST'), pair('地面科研', 'Ground-based science'), '2020.01',
    pair('在贵州听见宇宙', 'Listening to the universe from Guizhou'),
    pair('中国天眼 FAST 在贵州的喀斯特洼地接收微弱的射电信号。这是一座地面望远镜，不是卫星。',
      'Built in a karst depression in Guizhou, FAST listens for faint radio signals. It is a ground-based telescope, not a satellite.'),
    pair('500 米口径球面射电望远镜', 'Five-hundred-meter Aperture Spherical Radio Telescope'), [
      pair('中国天眼利用贵州的天然洼地建成，于二零二零年通过国家验收。它能从微弱的射电信号里寻找脉冲星。',
        'FAST was built in a natural depression in Guizhou and passed its national acceptance review in 2020. It can search faint radio signals for pulsars.'),
      pair('科研不止是取得一次观测。造出仪器、把它调好、长期观测，再让团队分析数据，才有机会把微弱的信号变成发现。',
        'Research is more than a single observation. Teams have to build and tune instruments, make observations over time, and turn faint signals into evidence.'),
    ], ['fast']),
  beat('closing', pair('结语', 'Epilogue'), pair('能力如何留下', 'What endures'), '',
    pair('留下来的，是做下一次的能力', 'The ability to do it again'),
    pair('火箭会离开发射台，探测任务也会结束。能留下来的，是人才、设施、标准和长期积累的经验。',
      'The rocket leaves its pad and the mission ends. People, facilities, standards and experience remain.'),
    pair('科研、工程、运行与应用', 'Research, engineering, operations and services'), [
      pair('从酒泉到文昌，从天宫到月背，一项任务结束，真正留下的是做下一次任务的人、方法和基础设施。',
        'From Jiuquan and Wenchang to Tiangong and the lunar far side, each mission leaves people, methods and infrastructure for the next one.'),
      pair('科研、制造和空间信息服务增强的是整个国家的能力，也为国防提供基础支撑。这样的支撑并不等同于具体的军事实力。',
        'Research, manufacturing and space services strengthen national capacity and help underpin national defense. That contribution is not, by itself, a measure of military capability.'),
    ], ['whitepaper']),
] as const

