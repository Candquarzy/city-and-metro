'use strict';
// 太原 · 2000，社区空白路网场景。现实中太原首条地铁于 2020 年开通。
// 地形和道路使用现代 OSM / WGS-84；规划片区、人口就业、价格与客流为游戏估算。
// 历史事件来源与重建方法见 docs/taiyuan-map.md。区域开放是游戏阶段，不是建城年份。
(function (CM) {
  const G = CM.GEOS.ty, P = G.proj;
  const ll = function (lat, lon) { return [+((lon - P.lon0) * P.kx).toFixed(2), +((P.lat0 - lat) * P.ky).toFixed(2)]; };
  const at = function (lat, lon, props) { const p = ll(lat, lon); return Object.assign({ x: p[0], y: p[1] }, props); };
  const box = function (south, west, north, east) { return [ll(north, west), ll(north, east), ll(south, east), ll(south, west)]; };
  const anchor = function (name, lat, lon, r) { return at(lat, lon, { name: name, r: r || 3 }); };
  const data = {
    city: '太原', riverName: '汾河', hsrYear: 2014,
    stages: [[2008, '城市重心南移'], [2014, '高铁与机场接驳'], [2020, '地铁建设时期']], stageLast: '多中心发展时期',
    eras: [
      { id: 'ty-e1', from: 2000, name: '汾河两岸的老城', tag: '史实参考',
        summary: '史实：太原主城区沿汾河两岸发展，2000 年尚无地铁；西山、东山夹着汾河谷地。估算：柳巷与迎泽大街是主要商业就业中心，小店和河西逐步增加居住与产业用地。',
        grow: { pop: { oldcity: 0.9, xiadian: 1.2, wanbailin: 1.2 }, jobs: { oldcity: 1.2, south: 1.2, industry: 1.1 } },
        corridors: [{ a: 'wanbailin', b: 'oldcity', f: 1.15 }, { a: 'xiadian', b: 'oldcity', f: 1.15 }] },
      { id: 'ty-e2', from: 2008, name: '城市重心南移', tag: '史实参考',
        summary: '史实：2008 年武宿机场改扩建工程竣工。长风商务区与城南公共文化设施逐步建设。估算：长风、小店和晋阳街的岗位增长，汾河两岸的跨河通勤增加。',
        grow: { pop: { xiadian: 1.4, jinyang: 1.3, jinyuan: 1.1 }, jobs: { changfeng: 1.8, south: 1.5, oldcity: 0.85 } },
        demand: { decayHW: 1.1 }, corridors: [{ a: 'jinyang', b: 'changfeng', f: 1.25 }, { a: 'xiadian', b: 'oldcity', f: 1.2 }],
        goals: [{ id: 'ty-g1', type: 'connect', months: 48, reward: 45000, title: '长风商务区', desc: '把长风商务区、汾河公园与柳巷老城连起来，兼顾通勤和公共文化活动。', anchors: [anchor('长风商务区', 37.818, 112.536, 4), anchor('汾河公园', 37.833, 112.535, 3), anchor('柳巷', 37.873, 112.566, 3)] }] },
      { id: 'ty-e3', from: 2014, name: '高铁与机场接驳', tag: '史实参考',
        summary: '史实：太原南站于 2014 年 7 月启用，带动晋阳街一带的铁路接驳需求。估算：城南、综改区与机场方向出行增长，高校集中区与老城之间需要更稳定的公共交通。',
        grow: { pop: { xiadian: 1.4, jinyang: 1.5, jinyuan: 1.2 }, jobs: { south: 1.6, industry: 1.4, changfeng: 1.3 } },
        demand: { hub: 1.15, decayHW: 1.15 }, corridors: [{ a: 'xiadian', b: 'oldcity', f: 1.25 }, { a: 'south', b: 'changfeng', f: 1.2 }],
        goals: [{ id: 'ty-g2', type: 'connect', months: 48, reward: 50000, title: '南站科教走廊', desc: '连接太原南站、山西大学、迎泽大街与太原站，形成贯穿南北的接驳走廊。', anchors: [anchor('太原南站', 37.788, 112.590, 4), anchor('山西大学', 37.797, 112.588, 4), anchor('迎泽大街', 37.861, 112.566, 3), anchor('太原站', 37.860, 112.580, 4)] }] },
      { id: 'ty-e4', from: 2020, name: '地铁建设时期', tag: '史实参考',
        summary: '史实：2020 年 12 月太原首条地铁 2 号线开通；2025 年 2 月 1 号线开通。玩法：真实线路不会自动建成，你仍可从空白路网规划南北骨干、东西轴线与机场接驳。',
        grow: { pop: { xiadian: 1.3, jinyang: 1.4, jinyuan: 1.2, north: 1.15 }, jobs: { south: 1.5, changfeng: 1.4, industry: 1.4 } },
        demand: { hub: 1.2, lz: 1.05 }, corridors: [{ a: 'south', b: 'oldcity', f: 1.2 }, { a: 'wanbailin', b: 'south', f: 1.15 }] },
      { id: 'ty-e5', from: 2026, name: '模拟未来', tag: '模拟',
        summary: '2026 年之后的人口、就业、经济和交通按游戏模型推演，不代表太原实际发展规划。',
        grow: { pop: { xiadian: 1.25, jinyang: 1.25, north: 1.1, oldcity: 0.75 }, jobs: { south: 1.35, industry: 1.3, changfeng: 1.2 } }, demand: { decayHW: 1.2 } },
    ],
    briefing: {
      lead: '从 2000 年尚无地铁的太原开始，沿汾河画出第一条线路。先连接柳巷、迎泽大街与太原站，再服务长风商务区、小店、太原南站和武宿机场。',
      modes: [['metro', '自定义空白路网', '2000 年太原尚无地铁。2020 年后的真实地铁只作为历史背景，不会自动出现。'], ['bus', '汾河两岸', '现代 OpenStreetMap 道路作为地理底图；片区与道路开放为游戏近似，不是历史路网档案。'], ['mountain', '两山夹一河', '西山、东山之间的汾河谷地是主要建设空间，风景区只能地下穿越。'], ['rail', '高铁与机场', '太原南站从 2014 年产生接驳需求；武宿机场在图内，机场范围只允许地下建设。']],
    },
    airport: { name: '太原武宿国际机场', closeYear: 9999, buildable: 'underground', runway: [ll(37.756, 112.607), ll(37.735, 112.630)] },
    runways: [{ a: ll(37.756, 112.607), b: ll(37.735, 112.630), from: 2008 }],
    regions: [
      { id: 'jinci', name: '晋祠风景区', geo: { park: '晋祠公园' }, poly: box(37.701, 112.431, 37.720, 112.460), open: 2000, plan: 'res', park: true },
      { id: 'westhills', name: '西山风景区', poly: [[0, 0], ll(38.06, 112.452), ll(37.97, 112.474), ll(37.83, 112.485), ll(37.76, 112.44), ll(37.70, 112.47), [0, 160]], scenic: true, open: null, relief: 1450 },
      { id: 'easthills', name: '东山风景区', poly: [ll(38.06, 112.656), [160, 0], [160, 160], ll(37.71, 112.65), ll(37.80, 112.65), ll(37.91, 112.64)], scenic: true, open: null, relief: 1350 },
      { id: 'airport', name: '武宿国际机场', poly: box(37.729, 112.599, 37.771, 112.644), open: 2000, plan: 'res', note: '机场用地保留，只允许地下建设' },
      { id: 'south', name: '晋阳街与太原南站', poly: box(37.771, 112.565, 37.806, 112.625), open: 2006, plan: 'mix', note: '太原南站 2014 年启用，片区开放为前期发展的游戏近似' },
      { id: 'oldcity', name: '迎泽与柳巷老城', poly: box(37.843, 112.538, 37.907, 112.603), open: 2000, plan: 'oldmix' },
      { id: 'wanbailin', name: '万柏林与河西', poly: box(37.793, 112.477, 37.907, 112.538), open: 2000, plan: 'mix' },
      { id: 'north', name: '北部城区与科教区', poly: box(37.907, 112.480, 38.020, 112.637), open: 2002, plan: 'resind', note: '区域开放年份为游戏设定' },
      { id: 'industry', name: '北部产业与综改走廊', poly: box(37.735, 112.603, 37.930, 112.654), open: 2003, plan: 'ind', note: '产业分区为游戏近似' },
      { id: 'changfeng', name: '长风文化商务区', poly: box(37.805, 112.505, 37.841, 112.565), open: 2006, plan: 'cbd', note: '长风文化商务区逐步建设的游戏阶段' },
      { id: 'xiadian', name: '小店与平阳路', poly: box(37.765, 112.544, 37.843, 112.605), open: 2000, plan: 'mix' },
      { id: 'jinyang', name: '晋阳湖与南部新城', poly: box(37.728, 112.493, 37.800, 112.562), open: 2008, plan: 'res' },
      { id: 'jinyuan', name: '晋源与晋祠方向', poly: box(37.701, 112.455, 37.778, 112.530), open: 2010, plan: 'res' },
    ],
    defaultRegion: { id: 'outer', name: '近郊发展区', open: 2005, plan: 'res' },
    plans: CM.DATA.plans,
    centers: [
      at(37.873, 112.566, { pop: 28000, jobs: 45000, r: 1.5 }),
      at(37.861, 112.563, { pop: 26000, jobs: 30000, r: 1.5 }),
      at(37.850, 112.550, { pop: 23000, jobs: 22000, r: 1.5 }),
      at(37.880, 112.520, { pop: 18000, jobs: 18000, r: 1.7 }),
      at(37.860, 112.520, { pop: 16000, jobs: 14000, r: 1.5 }),
      at(37.827, 112.566, { pop: 18000, jobs: 16000, r: 1.7 }),
      at(37.814, 112.536, { pop: 10000, jobs: 16000, r: 1.5 }),
      at(37.798, 112.585, { pop: 12000, jobs: 12000, r: 1.5 }),
      at(37.786, 112.580, { pop: 8000, jobs: 6000, r: 1.5 }),
      at(37.920, 112.565, { pop: 14000, jobs: 18000, r: 1.8 }),
      at(37.950, 112.580, { pop: 9000, jobs: 14000, r: 1.6 }),
      at(37.759, 112.540, { pop: 4000, jobs: 3000, r: 1.5 }),
      at(37.727, 112.494, { pop: 3500, jobs: 2500, r: 1.2 }),
      at(37.760, 112.620, { pop: 6000, jobs: 9000, r: 1.4 }),
    ],
    rural: { pop: 500, jobs: 180 },
    // 道路底图为现代数据，未指定道路由片区开放年份近似确定。
    roadYears: { '迎泽大街': 2000, '滨河东路': 2000, '滨河西路': 2000, '长风街': 2000, '南中环街': 2006 },
    bridgeYears: {}, bridgeDefaultYear: 2000, simRoads: [],
    landmarks: [
      at(37.708, 112.447, { id: 'ty_jinci', name: '晋祠圣母殿', w: 140, d: 140, year: 1102, kind: 'temple' }),
      at(37.861, 112.603, { id: 'ty_pagoda', name: '永祚寺双塔', w: 160, d: 200, year: 1612, kind: 'pagoda', h: 55 }),
      at(37.868, 112.529, { id: 'ty_museum', name: '山西博物院', w: 220, d: 180, year: 2005, kind: 'museum' }),
      at(37.854, 112.529, { id: 'ty_coal', name: '中国煤炭博物馆', w: 160, d: 130, year: 1989, kind: 'museum' }),
      at(37.860, 112.580, { id: 'ty_station', name: '太原站', w: 350, d: 140, year: 1975, kind: 'rail' }),
      at(37.788, 112.590, { id: 'ty_south', name: '太原南站', w: 450, d: 260, year: 2014, kind: 'rail' }),
      at(37.858, 112.522, { id: 'ty_tyut', name: '太原理工大学', w: 650, d: 500, year: 1953, kind: 'campus' }),
      at(37.797, 112.588, { id: 'ty_sxu', name: '山西大学', w: 700, d: 600, year: 1951, kind: 'campus' }),
      at(37.818, 112.530, { id: 'ty_theatre', name: '山西大剧院', w: 240, d: 160, year: 2011, kind: 'concert' }),
      at(37.819, 112.536, { id: 'ty_tymuseum', name: '太原博物馆', w: 180, d: 160, year: 2011, kind: 'museum' }),
      at(37.750, 112.535, { id: 'ty_sports', name: '山西体育中心', w: 350, d: 280, year: 2011, kind: 'stadium' }),
    ],
    facilities: [
      { id: 'ty_station', n: '太原站', t: 'rail', lm: 'ty_station', pax: [[2000, 2.0], [2010, 2.5], [2019, 2.8]] },
      { id: 'ty_south', n: '太原南站', t: 'rail', lm: 'ty_south', y0: [2014, 7], pax: [[2014.5, 1.5], [2020, 4.0], [2030, 5.0]] },
      { id: 'ty_airport', n: '武宿国际机场', t: 'air', at: ll(37.747, 112.632), r: 1.8, pax: [[2000, 0.45], [2008, 1.8], [2019, 4.0], [2030, 5.0]] },
      { id: 'ty_airport_t2', n: '武宿机场 T2', t: 'air', at: ll(37.747, 112.634), y0: [2008, 9], r: 1.8, pax: [[2008.67, 0.8], [2019, 1.8], [2030, 2.4]] },
      { id: 'ty_tyut', n: '太原理工大学', t: 'uni', lm: 'ty_tyut', w: 0.035 },
      { id: 'ty_sxu', n: '山西大学', t: 'uni', lm: 'ty_sxu', w: 0.03 },
      { id: 'ty_nuc', n: '中北大学', t: 'uni', at: ll(38.007, 112.456), w: 0.025 },
      { id: 'ty_first', n: '山西医科大学第一医院', t: 'hosp', at: ll(37.852, 112.568), w: 0.05 },
      { id: 'ty_second', n: '山西医科大学第二医院', t: 'hosp', at: ll(37.883, 112.573), w: 0.045 },
      { id: 'ty_provincial', n: '山西省人民医院', t: 'hosp', at: ll(37.849, 112.567), w: 0.04 },
      { id: 'ty_liuxiang', n: '柳巷商圈', t: 'shop', at: ll(37.873, 112.566), w: 0.07 },
      { id: 'ty_qinxian', n: '亲贤街商圈', t: 'shop', at: ll(37.825, 112.566), w: [[2000, 0.02], [2015, 0.05]] },
      { id: 'ty_xiayuan', n: '下元商圈', t: 'shop', at: ll(37.859, 112.518), w: 0.035 },
      { id: 'ty_changfeng', n: '长风商务区', t: 'cbd', at: ll(37.818, 112.536), y0: 2006, w: [[2006, 0.005], [2015, 0.035]] },
      { id: 'ty_jinci', n: '晋祠', t: 'scenic', lm: 'ty_jinci', w: 0.035 },
      { id: 'ty_pagoda', n: '永祚寺双塔', t: 'scenic', lm: 'ty_pagoda', w: 0.015 },
      { id: 'ty_museum', n: '山西博物院', t: 'scenic', lm: 'ty_museum', w: 0.015 },
      { id: 'ty_yingze', n: '迎泽公园', t: 'park', at: ll(37.855, 112.557), w: 0.02 },
      { id: 'ty_fenhe', n: '汾河公园', t: 'park', at: ll(37.833, 112.535), r: 2.0, w: 0.02 },
      { id: 'ty_theatre', n: '山西大剧院', t: 'venue', lm: 'ty_theatre', y0: 2011, w: 0.008 },
      { id: 'ty_sports', n: '山西体育中心', t: 'stadium', lm: 'ty_sports', y0: 2011, w: 0.012 },
      { id: 'ty_youthgames', n: '2019 年全国青年运动会', t: 'venue', lm: 'ty_sports', y0: [2019, 8], y1: [2019, 9], w: 0.12 },
    ],
    districtLabels: [],
    events: [
      { y: 2000, m: 1, tag: '场景', title: '汾河两岸的第一条线路', desc: '2000 年的太原尚无地铁。本局以空白路网开始，现代地形来自 OpenStreetMap，片区与人口就业为游戏估算。' },
      { y: 2008, m: 9, tag: '史实', title: '武宿机场改扩建工程竣工', desc: '武宿机场新航站楼投入使用，机场与中心城区之间的接驳需求增加。', fx: { demand: { hub: 1.1, months: 6 } } },
      { y: 2014, m: 7, tag: '史实', title: '太原南站启用', desc: '太原南站投入运营，晋阳街一带出现新的铁路接驳中心。', fx: { grow: { region: 'south', jobs: 1.3, years: 6 } } },
      { y: 2019, m: 8, tag: '史实', title: '第二届全国青年运动会', desc: '第二届全国青年运动会在山西举行，太原承办主要赛事，场馆周边出现集中的观赛出行。', fx: { demand: { lz: 1.2, hub: 1.1, months: 1 }, sat: { v: 1, months: 3 } } },
      { y: 2020, m: 12, tag: '史实', title: '史实背景：太原首条地铁开通', desc: '太原地铁 2 号线一期于 2020 年 12 月 26 日开通。本局的真实线路不会自动出现，继续建设你自己的网络。' },
      { y: 2025, m: 2, tag: '史实', title: '史实背景：太原地铁进入换乘时代', desc: '太原地铁 1 号线一期于 2025 年 2 月 22 日开通，与 2 号线形成换乘网络。本局线路仍完全由玩家规划。' },
      { y: 2026, m: 1, tag: '模拟', title: '进入模拟发展阶段', desc: '此后的城市变化按游戏模型推演，不代表真实规划。' },
    ],
    histTasks: [
      { id: 'ty1', appear: [2000, 3], deadline: [2006, 12], type: 'connect', reward: 45000, title: '老城南北骨干', desc: '连接柳巷、迎泽大街、太原站与太原理工大学，服务汾河两岸的老城核心。', anchors: [anchor('柳巷', 37.873, 112.566), anchor('迎泽大街', 37.861, 112.563), anchor('太原站', 37.860, 112.580, 4), anchor('太原理工大学', 37.858, 112.522, 4)] },
      { id: 'ty2', appear: [2002, 1], deadline: [2008, 12], type: 'connect', reward: 40000, title: '河西通勤', desc: '连接下元、汾河公园与柳巷，改善河西居民跨河进城。', anchors: [anchor('下元', 37.859, 112.518, 4), anchor('汾河公园', 37.833, 112.535, 3), anchor('柳巷', 37.873, 112.566)] },
      { id: 'ty3', appear: [2006, 1], deadline: [2012, 12], type: 'connect', reward: 45000, title: '长风与小店', desc: '连接小店、长风商务区与迎泽大街，支撑城南的发展。', anchors: [anchor('小店', 37.798, 112.570, 4), anchor('长风商务区', 37.818, 112.536, 4), anchor('迎泽大街', 37.861, 112.563)] },
      { id: 'ty4', appear: [2008, 9], deadline: [2014, 12], type: 'connect', reward: 50000, title: '武宿机场接驳', desc: '从长风商务区延伸至武宿机场。机场用地只能地下设站或地下穿越。', anchors: [anchor('长风商务区', 37.818, 112.536, 4), anchor('山西大学', 37.797, 112.588, 4), anchor('武宿机场', 37.747, 112.632, 5)] },
      { id: 'ty5', appear: [2010, 1], deadline: [2018, 12], type: 'connect', reward: 50000, title: '晋阳湖与晋祠方向', desc: '把晋阳湖、长风商务区与河西连接起来，服务西南部的居住和旅游出行。', anchors: [anchor('晋阳湖', 37.759, 112.520, 5), anchor('长风商务区', 37.818, 112.536, 4), anchor('下元', 37.859, 112.518, 4)] },
      { id: 'ty6', appear: [2014, 7], deadline: [2020, 12], type: 'connect', reward: 55000, title: '南站与机场', desc: '连接太原南站、太原站与武宿机场，让铁路和航空接入同一张网。', anchors: [anchor('太原南站', 37.788, 112.590, 4), anchor('太原站', 37.860, 112.580, 4), anchor('武宿机场', 37.747, 112.632, 5)] },
      { id: 'ty7', appear: [2016, 1], deadline: [2022, 12], type: 'coverage', target: 0.35, reward: 60000, title: '覆盖汾河两岸', desc: '2022 年底前，步行 15 分钟可到达地铁站的人口不低于全市人口的 35%。' },
    ],
    dynTasks: [
      { id: 'tyd1', from: [2003, 1], to: [2013, 12], type: 'connect', months: 36, reward: 35000, title: '北部科教通勤', desc: '连接北部科教区、老城与河西，为师生和北部居民提供更直接的出行。', anchors: [anchor('中北大学', 38.007, 112.456, 5), anchor('北部城区', 37.936, 112.555, 5), anchor('柳巷', 37.873, 112.566)] },
    ],
    taskNote: '太原本地任务参考汾河两岸、城南发展、科教走廊与枢纽接驳需求；不要求复刻真实地铁线路。',
    // v2.3 城市策略难题：覆盖太原地图近似的规划片区，不使用行政边界。
    scenarios: [
      { id: 'ty-community-sc1', theme: '太原：汾河两岸', title: '把河西与河东连起来', type: 'regionCov', from: [2003, 1], to: [2018, 12], months: 60, rewardMonths: 3,
        regions: ['wanbailin'], areaName: '万柏林', target: 0.4,
        desc: '汾河分隔河西与河东。先让万柏林居民步行可到达地铁，再通过桥隧换乘连接河东的老城与商务区。',
        tips: ['优先覆盖河西人口密集区域', '在合适的桥头与河东走廊设置换乘', '跨河线路要为后续客流增长留足运力'] },
      { id: 'ty-community-sc2', theme: '太原：南站与机场', title: '连接城市新枢纽', type: 'budgetConnect', from: [2014, 7], to: [2022, 12], months: 48, rewardMonths: 4, budgetX: 1.35,
        anchors: [['太原南站', 4], ['武宿机场', 4], ['小店', 3]],
        desc: '城市重心南移后，南站、机场与小店需要接入同一张轨道网络。用有限预算完成枢纽与居住区的接驳。',
        tips: ['先接南站和机场，再补小店客流', '利用南北骨干线减少重复建设', '枢纽间距离较远，适当放大站距'] },
    ],
    dataNote: [
      ['真实地理', 'hist', '汾河、道路、铁路、水面、公园与地名来自现代 OpenStreetMap（© OpenStreetMap 贡献者，ODbL 1.0），统一使用 WGS-84 投影，每格 250 m。'],
      ['史实参考', 'hist', '2008 年武宿机场改扩建、2014 年太原南站启用、2019 年全国青年运动会、2020 年地铁 2 号线与 2025 年地铁 1 号线开通。地标使用游戏通用建筑模型。'],
      ['估算', 'est', '规划片区为近似多边形，不是行政边界；人口、就业、片区与道路开放年份、机场客流、票价、造价、财政及经济参数均为游戏估算。'],
      ['模拟', 'sim', '2000 年采用空白路网，真实地铁不会自动出现。2026 年之后按模型推演，地图范围不覆盖太原市全域。'],
    ],
    // 策略难题与任务使用的规划地点；位置与几何不是 OSM 数据库的一部分。
    places: [
      ['太原南站', ll(37.788, 112.590)[0], ll(37.788, 112.590)[1], 0],
      ['武宿机场', ll(37.747, 112.632)[0], ll(37.747, 112.632)[1], 2],
      ['小店', ll(37.798, 112.570)[0], ll(37.798, 112.570)[1], 1],
    ].concat((G.places || []).map(function (p) { return p.slice(); })),
    lineColorsNice: ['#c91523', '#008fd3', '#f6a600', '#009b77', '#925eb0', '#e46c8d', '#4c70a8', '#84a93b', '#b4703b', '#29a9a1'],
  };
  // 同名轨道站点以 OSM 位置校正，不会预建真实地铁线路。
  const stops = new Map((G.places || []).filter(function (p) { return p[3] === 0; }).map(function (p) { return [p[0], p]; }));
  for (const t of data.histTasks.concat(data.dynTasks, data.eras.reduce(function (out, e) { return out.concat(e.goals || []); }, []))) {
    for (const a of t.anchors || []) {
      const p = stops.get(a.name);
      if (p && Math.hypot(p[1] - a.x, p[2] - a.y) < 12) { a.x = p[1]; a.y = p[2]; }
    }
  }
  (CM.MAP_LIST = CM.MAP_LIST || []).push({
    id: 'ty', name: '太原', title: '太原 · 2000', sub: '真实地理 · 2000 年起 · 人民币',
    desc: '从汾河两岸的老城出发，连接柳巷、长风商务区、小店、太原南站与武宿机场，规划两山之间的轨道交通。2000 年起，自定义空白路网。',
    facts: [['范围', '40 km × 40 km'], ['起始', '2000 年'], ['人口', '约 250 万（范围内估算）'], ['货币', '人民币（元）'], ['模式', '经营挑战 / 自由建造']],
    modes: ['challenge', 'free'], kind: 'real', mapVersion: 1, scenario: 'ty-2000',
    region: '中国内地', tagline: '两山夹一河，画出汾河两岸的地铁', difficulty: 2, tags: ['空白路网', '汾河', '机场接驳'],
    intro: '2000 年的太原还没有地铁。柳巷与迎泽大街商铺林立，河西与小店继续生长，长风商务区、太原南站和机场改扩建将带来新的出行需求。你需要在东西两山之间的汾河谷地，画出贯通南北、连接两岸的轨道网络。',
    features: [['wave', '汾河两岸', '河西与河东之间建设隧道或桥梁，服务老城与新城'], ['mountain', '两山夹一河', '东西山地限制开发，主要走廊沿汾河谷地展开'], ['plane', '南站与机场', '太原南站 2014 年启用，武宿机场位于地图内'], ['flag', '7 项城市任务', '老城骨干、长风商务区、科教走廊与枢纽接驳']],
    highlights: [[2000, '无地铁开局'], [2008, '武宿机场改扩建竣工'], [2014, '太原南站启用'], [2020, '首条地铁开通背景'], [2025, '地铁换乘时代背景']],
    geo: G, data: data, econ: { devOffset: -6, money: 1 },
    cfg: {
      W: 160, H: 160, START: { y: 2000, m: 1, d: 1, minute: 360 },
      growth: Object.assign({}, CM.CFG.growth, { popCurve: [[2000, 2.5e6], [2005, 2.9e6], [2010, 3.3e6], [2015, 3.8e6], [2020, 4.3e6], [2030, 4.8e6], [2050, 5.1e6], [2300, 5.2e6]], histEnd: 2020, jobsRatio: [[2000, 0.48], [2010, 0.52], [2020, 0.55], [2040, 0.57]] }),
      money: { code: 'CNY', unit: '元', wan: '万元', yi: '亿元', sym: '¥' }, econBase: 2000,
      cost: Object.assign({}, CM.CFG.cost, { trackPerKm: { underground: 38000, surface: 7000, elevated: 13000 }, riverPerKm: { underground: 22000, surface: 18000, elevated: 18000 }, hillPerKm: 18000, protectedPerKm: 6000 }),
      fareDefault: { mode: 'flat', flat: 1.5 }, fareRange: { min: 0, max: 8, step: 0.5 },
      economy: Object.assign({}, CM.CFG.economy, { startFunds: 280000, grantBase: [[2000, 12000], [2005, 20000], [2010, 35000], [2015, 60000], [2020, 85000], [2050, 120000]], debtLimit: -180000, rewardScale: 1.2 }),
      macro: { area: '地图范围（太原主城区及部分近郊，估算）', region: '中国内地', gdp0: 3500000, revRatio: [[2000, 0.12], [2010, 0.16], [2020, 0.17], [2040, 0.16]], revElastic: 1.4,
        prod: [[2000, 0.085], [2005, 0.09], [2010, 0.075], [2014, 0.055], [2018, 0.055], [2020, 0.035], [2030, 0.028], [2050, 0.015], [2080, 0.012]], infl: 'cn', longRun: { infl: 0.02 }, histEnd: 2020, ref: 'cn',
        struct: { trade: 0.4, fin: 0.3, ind: 0.75, tour: 0.45, prop: 0.5 }, events: [] },
    },
    cam: { cx: ll(37.843, 112.548)[0], cy: ll(37.843, 112.548)[1], zoom: 17 },
  });
})(window.CM);
