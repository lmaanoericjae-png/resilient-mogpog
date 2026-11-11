import { el, clear, $ } from './dom.js';
import { getAdvisory } from './logic.js';
import { load, save } from './store.js';
import { t } from './i18n.js';

export function initAdvisory(rules) {
  const typeSel = $('#adv-type');
  const levelSel = $('#adv-level');
  const expSel = $('#adv-exposure');
  const out = $('#adv-result');
  $('#adv-status').textContent = rules.status;

  rules.warningTypes.forEach(tp => typeSel.append(el('option', { value: tp.id, text: tp.label })));
  rules.exposureTypes.forEach(e => expSel.append(el('option', { value: e.id, text: e.label })));

  function fillLevels() {
    const tp = rules.warningTypes.find(x => x.id === typeSel.value);
    clear(levelSel);
    tp.levels.forEach(l => levelSel.append(el('option', { value: l.id, text: l.label })));
  }

  function explain(r) {
    let s = t('adv.explain.base', { type: r.parts.typeLabel, level: r.parts.levelLabel, base: r.base });
    if (r.escalated && r.parts.exposureLabel) s += t('adv.explain.up', { exposure: r.parts.exposureLabel, s: r.severity });
    else if (r.parts.exposureLabel && r.base > 0) s += t('adv.explain.same', { exposure: r.parts.exposureLabel });
    return s;
  }

  function render() {
    const r = getAdvisory(rules, typeSel.value, levelSel.value, expSel.value);
    clear(out);
    if (!r) return;
    out.className = `result tone-${r.tone}`;
    out.append(
      el('p', { class: 'result-level', text: t('adv.levelOf', { s: r.severity, max: rules.maxSeverity }) }),
      el('h3', { text: r.label }),
      el('ul', {}, r.steps.map(s => el('li', { text: s }))),
      r.exposureNote ? el('p', { class: 'note', text: r.exposureNote }) : null,
      el('p', { class: 'why' }, el('strong', { text: t('adv.why') }), explain(r)));
    save('advisory', { type: typeSel.value, level: levelSel.value, exposure: expSel.value });
  }

  const saved = load('advisory', null);
  if (saved && rules.warningTypes.some(x => x.id === saved.type)) typeSel.value = saved.type;
  fillLevels();
  if (saved) {
    if ([...levelSel.options].some(o => o.value === saved.level)) levelSel.value = saved.level;
    if ([...expSel.options].some(o => o.value === saved.exposure)) expSel.value = saved.exposure;
  }

  typeSel.addEventListener('change', () => { fillLevels(); render(); });
  levelSel.addEventListener('change', render);
  expSel.addEventListener('change', render);
  render();
}
