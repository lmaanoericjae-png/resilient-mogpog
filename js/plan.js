import { el, clear, $ } from './dom.js';
import { planProgress } from './logic.js';
import { load, save } from './store.js';
import { t } from './i18n.js';

const FIELDS = [
  { id: 'household', kind: 'number' },
  { id: 'helpNeeds', kind: 'text' },
  { id: 'meeting', kind: 'text' },
  { id: 'contactName', kind: 'text' },
  { id: 'contactNumber', kind: 'tel' },
  { id: 'center', kind: 'center' },
  { id: 'pets', kind: 'text' },
  { id: 'docs', kind: 'text' }
];

export function initPlan(centers) {
  const form = $('#plan-form');
  const prog = $('#plan-progress');
  let plan = load('plan', {});
  const ids = FIELDS.map(f => f.id);

  function updateProgress() {
    const p = planProgress(plan, ids);
    prog.textContent = t('plan.progress', { f: p.filled, t: p.total });
  }

  function build() {
    clear(form);
    FIELDS.forEach(f => {
      const common = { id: 'plan-' + f.id, name: f.id };
      let input;
      if (f.kind === 'center') {
        input = el('select', common, el('option', { value: '', text: t('plan.choose') }),
          centers.map(c => el('option', { value: c.id, text: `${c.name} (${c.barangay})` })));
        input.value = plan[f.id] || '';
      } else {
        input = el('input', { ...common, type: f.kind, ...(f.kind === 'number' ? { min: 1, inputmode: 'numeric' } : {}) });
        input.value = plan[f.id] || '';
      }
      const handler = () => { plan[f.id] = input.value; save('plan', plan); updateProgress(); };
      input.addEventListener(f.kind === 'center' ? 'change' : 'input', handler);
      form.append(el('label', {}, el('span', { text: t('plan.' + f.id) }), input));
    });
    updateProgress();
  }

  $('#plan-print').addEventListener('click', () => window.print());
  $('#plan-clear').addEventListener('click', () => { plan = {}; save('plan', plan); build(); });
  build();
}
