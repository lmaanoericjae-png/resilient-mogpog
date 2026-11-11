import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterCenters, uniqueBarangays, getAdvisory, checklistProgress, planProgress, mapSearchUrl } from '../js/logic.js';

const j = f => JSON.parse(readFileSync(new URL(`../data/${f}.json`, import.meta.url)));
const centers = j('evacuation-centers');
const rules = j('advisory-rules');
const checklist = j('checklist');

test('filter by barangay', () => {
  const r = filterCenters(centers, { barangay: 'Laon' });
  assert.ok(r.length > 0 && r.every(c => c.barangay === 'Laon'));
});
test('search is case-insensitive and trims', () => {
  assert.ok(filterCenters(centers, { query: '  COVERED ' }).length >= 2);
});
test('search by facility', () => {
  assert.equal(filterCenters(centers, { query: 'medical' }).length, 1);
});
test('no match returns empty', () => {
  assert.deepEqual(filterCenters(centers, { query: 'zzzz' }), []);
});
test('uniqueBarangays sorted and unique', () => {
  const b = uniqueBarangays(centers);
  assert.equal(new Set(b).size, b.length);
  assert.deepEqual(b, [...b].sort((x, y) => x.localeCompare(y)));
});
test('no warning gives level 0 regardless of exposure', () => {
  assert.equal(getAdvisory(rules, 'rainfall', 'none', 'riverine').severity, 0);
});
test('orange rainfall near river escalates to 3', () => {
  const r = getAdvisory(rules, 'rainfall', 'orange', 'riverine');
  assert.equal(r.severity, 3); assert.ok(r.escalated);
  assert.match(r.explanation, /raised to level 3/);
});
test('severity is capped at max', () => {
  assert.equal(getAdvisory(rules, 'rainfall', 'red', 'lowlying').severity, 3);
});
test('coastal does not escalate rainfall; coastal escalates wind', () => {
  assert.equal(getAdvisory(rules, 'rainfall', 'yellow', 'coastal').severity, 1);
  assert.equal(getAdvisory(rules, 'wind', '1', 'coastal').severity, 2);
});
test('unknown ids return null', () => {
  assert.equal(getAdvisory(rules, 'x', 'y', 'z'), null);
  assert.equal(getAdvisory(rules, 'rainfall', 'purple', 'riverine'), null);
});
test('every severity has an action', () => {
  for (let s = 0; s <= rules.maxSeverity; s++) assert.ok(rules.actions[s].steps.length);
});
test('checklist progress', () => {
  assert.equal(checklistProgress(checklist.groups, {}).done, 0);
  const all = Object.fromEntries(checklist.groups.flatMap(g => g.items.map(i => [i.id, true])));
  assert.equal(checklistProgress(checklist.groups, all).percent, 100);
});

test('filter by status', () => {
  assert.equal(filterCenters(centers, { status: 'open' }).length, 1);
  assert.equal(filterCenters(centers, { status: 'unknown' }).length, centers.length - 1);
});
test('planProgress counts non-empty fields', () => {
  assert.deepEqual(planProgress({ a: 'x', b: '  ', c: 0 }, ['a', 'b', 'c', 'd']), { filled: 2, total: 4 });
});
test('mapSearchUrl encodes and skips noMap', () => {
  const u = mapSearchUrl({ name: 'Laon Hall', barangay: 'Laon' }, 'Mogpog, Marinduque');
  assert.match(u, /^https:\/\/www\.openstreetmap\.org\/search\?query=Laon%20Hall/);
  assert.equal(mapSearchUrl({ name: 'x', barangay: 'y', noMap: true }, 'z'), null);
});
test('advisory exposes label parts', () => {
  const r = getAdvisory(rules, 'rainfall', 'red', 'upland');
  assert.equal(r.parts.levelLabel, 'Red');
});
test('Filipino file covers every action, exposure, checklist item and hotline', () => {
  const fil = j('fil');
  for (const k of Object.keys(rules.actions)) {
    assert.ok(fil.rules.actions[k].label);
    assert.equal(fil.rules.actions[k].steps.length, rules.actions[k].steps.length);
  }
  for (const e of rules.exposureTypes) assert.ok(fil.rules.exposure[e.id].note);
  for (const g of checklist.groups) { assert.ok(fil.checklist.groups[g.id]); for (const i of g.items) assert.ok(fil.checklist.items[i.id], i.id); }
  for (const g of checklist.guides) assert.equal(fil.checklist.guides[g.phase].steps.length, g.steps.length);
  for (const h of j('hotlines')) assert.ok(fil.hotlines[h.name]);
});
