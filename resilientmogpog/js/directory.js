import { el, clear, $ } from './dom.js';
import { filterCenters, uniqueBarangays } from './logic.js';

export function initDirectory(centers) {
  const search = $('#dir-search');
  const select = $('#dir-barangay');
  const list = $('#dir-list');
  const count = $('#dir-count');

  uniqueBarangays(centers).forEach(b => select.append(el('option', { value: b, text: b })));

  function render() {
    const rows = filterCenters(centers, { query: search.value, barangay: select.value });
    clear(list);
    count.textContent = `${rows.length} of ${centers.length} centers shown`;
    if (!rows.length) {
      list.append(el('p', { class: 'empty', text: 'No evacuation centers match your search.' }));
      return;
    }
    rows.forEach(c => list.append(card(c)));
  }

  function card(c) {
    const facts = [
      ['Type', c.type],
      ['Capacity', c.capacity ? `${c.capacity} people` : 'Not yet provided'],
      ['Facilities', c.facilities.length ? c.facilities.join(', ') : 'Not yet provided'],
      ['Last verified', c.lastVerified || 'Not yet verified']
    ];
    return el('article', { class: 'card center' },
      el('header', {},
        el('h3', { text: c.name }),
        el('span', { class: 'chip', text: c.barangay }),
        c.sample ? el('span', { class: 'chip chip-warn', text: 'Sample / unverified' }) : null),
      el('dl', {}, facts.map(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])),
      c.routeNote ? el('p', { class: 'note', text: c.routeNote }) : null);
  }

  search.addEventListener('input', render);
  select.addEventListener('change', render);
  render();
}
