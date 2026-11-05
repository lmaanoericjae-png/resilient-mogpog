import { el, clear, $ } from './dom.js';
import { getAdvisory } from './logic.js';
import { load, save } from './store.js';

export function initAdvisory(rules) {
  const typeSel = $('#adv-type');
  const levelSel = $('#adv-level');
  const expSel = $('#adv-exposure');
  const out = $('#adv-result');
  $('#adv-status').textContent = rules.status;

  rules.warningTypes.forEach(t => typeSel.append(el('option', { value: t.id, text: t.label })));
  rules.exposureTypes.forEach(e => expSel.append(el('option', { value: e.id, text: e.label })));

  function fillLevels() {
    const t = rules.warningTypes.find(x => x.id === typeSel.value);
    clear(levelSel);
    t.levels.forEach(l => levelSel.append(el('option', { value: l.id, text: l.label })));
  }

  function render() {
    const r = getAdvisory(rules, typeSel.value, levelSel.value, expSel.value);
    clear(out);
    if (!r) return;
    out.className = `result tone-${r.tone}`;
    out.append(
      el('p', { class: 'result-level', text: `Level ${r.severity} of ${rules.maxSeverity}` }),
      el('h3', { text: r.label }),
      el('ul', {}, r.steps.map(s => el('li', { text: s }))),
      r.exposureNote ? el('p', { class: 'note', text: r.exposureNote }) : null,
      el('p', { class: 'why' }, el('strong', { text: 'Why this advice: ' }), r.explanation));
    save('advisory', { type: typeSel.value, level: levelSel.value, exposure: expSel.value });
  }

  const saved = load('advisory', null);
  if (saved) { typeSel.value = saved.type; }
  fillLevels();
  if (saved) { levelSel.value = saved.level; expSel.value = saved.exposure; }

  typeSel.addEventListener('change', () => { fillLevels(); render(); });
  levelSel.addEventListener('change', render);
  expSel.addEventListener('change', render);
  render();
}
