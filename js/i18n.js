import { load, save } from './store.js';

export const lang = load('lang', 'en');
let fil = {};

const EN = {
  'skip': 'Skip to content', 'lang': 'Filipino',
  'tab.directory': 'Evacuation centers', 'tab.advisory': 'What should I do?', 'tab.hub': 'Get prepared', 'tab.plan': 'My family plan',
  'dir.title': 'Evacuation center directory', 'dir.search': 'Search', 'dir.search.ph': 'Name, type or facility',
  'dir.barangay': 'Barangay', 'dir.all': 'All barangays', 'dir.status': 'Status', 'dir.statusAll': 'All statuses',
  'dir.count': '{n} of {total} centers shown', 'dir.empty': 'No evacuation centers match your search.',
  'type': 'Type', 'capacity': 'Capacity', 'capacity.people': '{n} people', 'facilities': 'Facilities',
  'lastVerified': 'Last verified', 'status': 'Status', 'notProvided': 'Not yet provided', 'notVerified': 'Not yet verified',
  'sample': 'Sample / unverified', 'findMap': 'Find on map',
  'status.open': 'Open', 'status.closed': 'Closed', 'status.full': 'Full', 'status.unknown': 'Unknown',
  'statusAsOf': '{s} (updated {d})', 'statusNone': '{s} (not yet updated)',
  'adv.title': 'What should I do?', 'adv.type': 'Warning type', 'adv.level': 'Warning level', 'adv.exposure': 'Where you live',
  'adv.levelOf': 'Level {s} of {max}', 'adv.why': 'Why this advice: ',
  'adv.explain.base': '{type}: {level} sets a base level of {base}.',
  'adv.explain.up': ' Because you are in "{exposure}", the advice is raised to level {s}.',
  'adv.explain.same': ' Your location type ("{exposure}") does not raise it further for this warning.',
  'hub.title': 'Get prepared', 'hub.checklist': 'Go-bag checklist', 'hub.reset': 'Reset checklist',
  'hub.progress': '{done} of {total} items packed ({pct}%)', 'hub.guides': 'Before, during, after',
  'hub.hotlines': 'Emergency hotlines', 'hub.pending': 'Number pending',
  'plan.title': 'My family emergency plan', 'plan.privacy': 'These answers are stored only on this device. They are not sent anywhere.',
  'plan.household': 'People in the household', 'plan.helpNeeds': 'Who needs extra help (e.g. elderly, infants)',
  'plan.meeting': 'Family meeting point', 'plan.contactName': 'Out-of-area contact name', 'plan.contactNumber': 'Contact number',
  'plan.center': 'Evacuation center we will go to', 'plan.pets': 'Plan for pets or livestock',
  'plan.docs': 'Where important documents are kept', 'plan.choose': 'Choose a center',
  'plan.print': 'Print plan', 'plan.clear': 'Clear plan', 'plan.progress': '{f} of {t} fields filled',
  'footer': 'Student project for Web Systems and Technologies 1, MarSU. Not an official government service. Follow PAGASA and local officials.',
  'updated': 'Data last updated {d}.',
  'loadError': 'Could not load data files. If you opened index.html directly, run a local server (see README).'
};

export async function initI18n() {
  if (lang !== 'fil') return;
  try { fil = await (await fetch('data/fil.json')).json(); } catch { fil = {}; }
}

export function t(key, vars = {}) {
  const s = (lang === 'fil' && fil.ui && fil.ui[key]) || EN[key] || key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}
export const tryT = (key, fallback) => (lang === 'fil' && fil.ui && fil.ui[key]) || fallback;

export function setLang(l) { save('lang', l); location.reload(); }

export function applyStatic() {
  document.documentElement.lang = lang === 'fil' ? 'fil' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(n => { n.placeholder = t(n.dataset.i18nPh); });
}

export function localizeRules(rules) {
  if (lang !== 'fil' || !fil.rules) return rules;
  const f = fil.rules, r = structuredClone(rules);
  r.status = f.status || r.status;
  r.warningTypes.forEach(tp => {
    tp.label = (f.types && f.types[tp.id]) || tp.label;
    tp.levels.forEach(l => { l.label = (f.levels && (f.levels[`${tp.id}.${l.id}`] || f.levels[l.id])) || l.label; });
  });
  r.exposureTypes.forEach(e => { const x = f.exposure && f.exposure[e.id]; if (x) { e.label = x.label; e.note = x.note; } });
  Object.entries(f.actions || {}).forEach(([k, v]) => Object.assign(r.actions[k], v));
  return r;
}

export function localizeChecklist(cl) {
  if (lang !== 'fil' || !fil.checklist) return cl;
  const f = fil.checklist, c = structuredClone(cl);
  c.note = f.note || c.note;
  c.groups.forEach(g => { g.label = f.groups[g.id] || g.label; g.items.forEach(i => { i.label = f.items[i.id] || i.label; }); });
  c.guides.forEach(g => { const x = f.guides[g.phase]; if (x) { g.phase = x.phase; g.steps = x.steps; } });
  return c;
}

export function localizeHotlines(hl) {
  if (lang !== 'fil' || !fil.hotlines) return hl;
  return hl.map(h => ({ ...h, ...(fil.hotlines[h.name] || {}) }));
}
