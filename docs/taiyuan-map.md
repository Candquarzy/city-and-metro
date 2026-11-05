# 太原地图社区版

此 fork 在原版 v2.5.0 基础上新增太原（`ty` / `ty-2000`），保留原作者 VinsonFung、[原版游戏](https://city-and-metro.pages.dev)、[原始仓库](https://github.com/VinsonFung/city-and-metro)及原有许可。地图支持经营挑战、自由建造、自定义起年、全图解锁以及原有 JSON 存档。

打开仓库根目录 `index.html`，选择「开始游戏 → 太原」即可游玩；无需安装依赖。原作者在线游戏不包含此 fork 新增的地图。

## 场景边界

- 默认 2000 年，空白路网。现实中太原首条地铁于 2020 年 12 月开通；本场景中的真实地铁只作为历史背景，不预建、也不会自动出现。
- 地图 160 × 160 格，每格 250 m，约 40 × 40 km。范围包含中心城区、汾河两岸、西山和东山部分山地、晋祠、小店、晋阳湖及武宿机场，不代表整个太原市行政区域。
- 武宿机场位于图内，机场用地只允许地下设站和穿越。太原南站从 2014 年 7 月产生高铁接驳需求；机场新航站楼从 2008 年 9 月开始提供服务。
- 11 处地标使用现有游戏通用模型，23 项设施及 7 项主线任务服务交通规划。另有阶段目标和动态任务。
- 片区是用于游戏规划的近似多边形，不宣称是行政边界；开放年份是城市发展阶段，不表示该片区建城年份。
- 道路、水面、公园、铁路和地名采用现代 OSM 数据。道路开放按片区年代近似处理，不是历史路网的逐年复原。人口、就业、客流、建设费用与经济曲线均为范围内的游戏估算；2026 年之后为模型推演。

## 数据与复现

`js/geo_ty.js` 是离线地理数据库，按 ODbL 1.0 提供，署名 © OpenStreetMap contributors。`js/data_ty.js` 提供太原场景配置。所有坐标均为 WGS-84，经纬度不再做 GCJ-02 偏移。

投影：`x = (lon - 112.30) × 350.0`，`y = (38.06 - lat) × 443.8`。以太原纬度附近的等距近似投影到 250 m 格网，编码精度为 1/64 格。

重建时需要 Node.js 和网络；正常游玩不需要网络：

```sh
node scripts/build-taiyuan-geo.mjs --download
node scripts/build-taiyuan-geo.mjs
node scripts/test-taiyuan.mjs
node scripts/build.mjs
node scripts/verify-game.mjs --dist
```

首条命令下载缺少的公开 Overpass 响应，缓存在 `.tools/taiyuan-osm/`（已忽略），第二条从缓存重建。需更新提取数据时，先移走该缓存目录。生成文件的 `source` 包含查询、范围、OSM 数据时间与原始响应 SHA-256；相同缓存生成相同结果。生成过程只保留道路、非地铁铁路、地表水、绿地与地名；合并多多边形成员并保留岛屿内环，排除重复的成员面。

完整项目回归：`node scripts/test-beijing.mjs`、`node scripts/test-v23.mjs`、`node scripts/test-v24.mjs`、`node scripts/test-v25.mjs`。太原支持两个可选城市策略难题，任务沿用 v2.5 的复合条件机制。

## 历史参考

- [中国民用航空局：太原机场改扩建工程竣工](http://www.caac.gov.cn/WZWSREL1hXWlgvTUhZVy8yMDA4MDYvdDIwMDgwNjMwXzEyMDA4Lmh0bWw=)：2008 年 6 月改扩建工程通过验收；新航站楼按 2008 年 9 月启用。
- [太原市人民政府：太原南站开通运营](https://taiyuan.gov.cn/tsty22/20260120/1127044.html)：太原南站于 2014 年 7 月 1 日正式投入运营。
- [中国国家铁路集团：太原南站](http://wap.china-railway.com.cn/zyyw/lkys/fwss/202011/t20201102_110138.html)：车站建筑与位置背景。
- [人民网：太原地铁 2 号线一期开通运营](http://cpc.people.com.cn/n1/2020/1227/c117005-31980231.html)：太原首条地铁于 2020 年 12 月 26 日开通。
- [新华网山西：太原地铁进入“换乘时代”](http://www.sx.news.cn/20250221/73f2a118930f4508a5a3c86c7e9bd7db/c.html)：2020 年首条地铁开通与 2025 年地铁网络背景。
- [中国中铁：太原地铁 1 号线一期建成通车](https://www.crecg.com/web/xwzx61/gsyw87/2025030315401867430/index.html)：2025 年 2 月 22 日开通。

地图数据说明：[OpenStreetMap 版权及许可](https://www.openstreetmap.org/copyright)、[Overpass QL 文档](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL)。
