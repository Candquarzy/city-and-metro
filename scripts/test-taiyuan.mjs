// Taiyuan acceptance checks use generated cities and isolated memory storage.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), memory = new Map();
const c = { console, performance, atob, btoa, TextEncoder, TextDecoder, setTimeout, clearTimeout, navigator: { hardwareConcurrency: 4, deviceMemory: 4 }, matchMedia: () => ({ matches: false }), localStorage: { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) } };
c.window = c; vm.createContext(c);
for (const [, src] of (await readFile(path.join(root, 'index.html'), 'utf8')).matchAll(/<script src="([^"]+)"/g)) {
  vm.runInContext(await readFile(path.join(root, src), 'utf8'), c, { filename: src });
  if (src === 'js/save.js') break;
}
const C = c.CM, m = C.MAPS.ty;
assert.ok(m && C.MAP_ORDER.filter(id => id === 'ty').length === 1);
assert.equal(C.MAP_ORDER.length, 12);
assert.deepEqual(Array.from(m.modes), ['challenge', 'free']);
assert.equal(m.cfg.W % C.CFG.ZONE, 0); assert.equal(m.cfg.H % C.CFG.ZONE, 0);
assert.match(m.data.briefing.lead, /2000 年尚无地铁的太原/);
assert.equal(m.data.initialNetwork, undefined);
const inside = p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0 && p.x < m.cfg.W && p.y < m.cfg.H;
const regionIds = new Set(m.data.regions.map(r => r.id).concat(m.data.defaultRegion.id));
assert.equal(regionIds.size, m.data.regions.length + 1);
const tasks = m.data.histTasks.concat(m.data.dynTasks, m.data.eras.flatMap(e => e.goals || []));
for (const task of tasks) for (const a of task.anchors || []) assert.ok(inside(a), task.id + ': anchor outside map');
for (const e of m.data.eras) {
  for (const weights of Object.values(e.grow || {})) for (const id of Object.keys(weights)) assert.ok(regionIds.has(id), 'Unknown era region ' + id);
  for (const corridor of e.corridors || []) { assert.ok(regionIds.has(corridor.a)); assert.ok(regionIds.has(corridor.b)); }
}
for (const list of [m.data.landmarks, m.data.facilities, tasks]) assert.equal(new Set(list.map(x => x.id)).size, list.length, 'Duplicate IDs');
for (const lm of m.data.landmarks) assert.ok(inside(lm), lm.id);
for (const f of m.data.facilities) {
  if (f.lm) assert.ok(m.data.landmarks.some(lm => lm.id === f.lm), f.id + ': missing landmark');
  else assert.ok(inside({ x: f.at[0], y: f.at[1] }), f.id + ': missing portal/position');
}
assert.ok(m.geo.roads.length > 1000 && m.geo.water.length > 10 && m.geo.parks.length > 10);
for (const road of m.geo.roads) assert.ok([2, 3, 4].includes(road[1]), 'Road class must be supported by the renderer and traffic capacities');
assert.equal(m.geo.source.license, 'ODbL-1.0');
assert.equal(m.geo.source.extracts.length, 3);
for (const source of m.geo.source.extracts) assert.match(source.sha256, /^[0-9a-f]{64}$/);
C.useMap('ty');
const old = new C.City(); old.generate(20000101, 2000);
const project = (lat, lon) => [(lon - m.geo.proj.lon0) * m.geo.proj.kx, (m.geo.proj.lat0 - lat) * m.geo.proj.ky];
const cell = (city, lat, lon) => city.cellAt(...project(lat, lon));
assert.equal(old.regions[old.region[cell(old, 37.873, 112.566)]].id, 'oldcity');
assert.equal(old.regions[old.region[cell(old, 37.859, 112.518)]].id, 'wanbailin');
assert.ok(old.isAirportCell(cell(old, 37.747, 112.632), 2000));
for (const region of old.regions) assert.ok(region.cells > 0, region.id + ': empty region');
assert.ok(Array.from(old.waterD).some(v => v < 0), 'Fen River must rasterize');
assert.ok(old.cellLocked(cell(old, 37.759, 112.520)), 'Jinyang Lake district starts locked');
const future = new C.City(); future.generate(20000101, 2020);
C.Fac.list(future);
assert.ok(!future.cellLocked(cell(future, 37.759, 112.520)), 'Jinyang Lake district must open by 2020');
for (const [id, before, after] of [['ty_south', 2014.45, 2014 + 6 / 12], ['ty_airport_t2', 2008.6, 2008 + 8 / 12]]) {
  const f = C.Fac.byId(id); assert.ok(f, id);
  assert.equal(C.Fac.active(f, before, future), false, id + ': opening boundary');
  assert.equal(C.Fac.active(f, after, future), true, id + ': must open');
}
assert.equal(C.Fac.active(C.Fac.byId('ty_sports'), 2019.59, future), true);
assert.equal(C.Fac.active(C.Fac.byId('ty_youthgames'), 2019.5, future), false);
assert.equal(C.Fac.active(C.Fac.byId('ty_youthgames'), 2019 + 7 / 12, future), true);
assert.equal(C.Fac.active(C.Fac.byId('ty_youthgames'), 2019 + 8 / 12, future), false);
console.log('PASS Taiyuan geography, regions, river, dates and airport');

const g = C.Game.create({ mode: 'challenge', seed: 20000101 });
assert.equal(g.mapId, 'ty'); assert.ok(g.model.trafficReady());
assert.ok(Number.isFinite(g.econ.funds) && g.econ.funds > 0);
assert.ok(g.snapshotMetrics().pop > 2e6 && g.snapshotMetrics().pop < 3e6);
g.edit(net => {
  const line = C.Metro.newLine(net, '太原测试线');
  const a = C.Metro.addStation(net, ...project(37.873, 112.566), { size: 'S', type: 'underground' }, g.city);
  const b = C.Metro.addStation(net, ...project(37.861, 112.563), { size: 'S', type: 'underground' }, g.city);
  return C.Metro.addSegment(net, line, a, b, [], 'underground');
});
assert.equal(g.canConfirm().ok, true, JSON.stringify(g.draftEval()?.conflicts));
assert.equal(g.confirmDraft().ok, true);
g.startJump(1); while (g.jumping) g.stepJump();
assert.equal(g.clock.m, 2); assert.equal(g.econ.ledger.length, 1);
assert.ok(Number.isFinite(g.econ.funds));
const snapshot = JSON.parse(JSON.stringify(g.serialize())), body = JSON.stringify(snapshot);
const parsed = C.Save.parseEnvelope(JSON.stringify({ format: C.CFG.SAVE_FORMAT, version: C.CFG.SAVE_VERSION, body, checksum: C.U.fnv(body) })).payload;
C.useMap('gz'); C.useMap(parsed.meta.map);
const restored = C.Game.restore(parsed);
assert.equal(restored.mapId, 'ty'); assert.deepEqual(JSON.parse(JSON.stringify(restored.net)), snapshot.net);
assert.equal(restored.econ.funds, snapshot.econ.funds); assert.equal(restored.clock.m, 2);
const free = C.Game.create({ mode: 'free', startYear: 2001, unlockAll: true, seed: 20000101 });
assert.equal(free.clock.y, 2001); assert.ok(free.econ.isFree()); assert.ok(free.city.unlockAll);
console.log('PASS Taiyuan challenge construction, month settlement, save round trip and custom Free Build');
