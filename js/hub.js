import { el, clear, $ } from './dom.js';
import { checklistProgress } from './logic.js';
import { load, save } from './store.js';

export function initHub(checklist, hotlines) {
  const box = $('#hub-checklist');
  const bar = $('#hub-progress');
  const label = $('#hub-progress-label');
  let checked = load('checklist', {});
  $('#hub-note').textContent = checklist.note;

  function updateProgress() {
    const p = checklistProgress(checklist.groups, checked);
    bar.value = p.percent;
    label.textContent = `${p.done} of ${p.total} items packed (${p.percent}%)`;
  }

  checklist.groups.forEach(g => {
    box.append(el('fieldset', {},
      el('legend', { text: g.label }),
      g.items.map(i => el('label', { class: 'check' },
        el('input', {
          type: 'checkbox', checked: !!checked[i.id],
          onchange: e => { checked[i.id] = e.target.checked; save('checklist', checked); updateProgress(); }
        }),
        el('span', { text: i.label })))));
  });
  $('#hub-reset').addEventListener('click', () => {
    checked = {}; save('checklist', checked);
    box.querySelectorAll('input').forEach(i => { i.checked = false; });
    updateProgress();
  });
  updateProgress();

  const guides = $('#hub-guides');
  checklist.guides.forEach(g => guides.append(el('details', {},
    el('summary', { text: g.phase }),
    el('ol', {}, g.steps.map(s => el('li', { text: s }))))));

  const hl = $('#hub-hotlines');
  hotlines.forEach(h => hl.append(el('li', {},
    el('strong', { text: h.name }),
    h.number
      ? el('a', { class: 'tel', href: `tel:${h.number}`, text: h.number })
      : el('span', { class: 'chip chip-warn', text: 'Number pending' }),
    el('small', { text: h.note }))));
}
