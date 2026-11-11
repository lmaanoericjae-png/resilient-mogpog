import { el, clear, $ } from './dom.js';
import { filterCenters, uniqueBarangays, mapSearchUrl } from './logic.js';
import { t } from './i18n.js';

export function initDirectory(centers, areaName) {
  const search = $('#dir-search');
  const select = $('#dir-barangay');
  const statusSel = $('#dir-status');
  const list = $('#dir-list');
  const count = $('#dir-count');

  uniqueBarangays(centers).forEach(b => select.append(el('option', { value: b, text: b })));
  ['open', 'full', 'closed', 'unknown'].forEach(s =>
    statusSel.append(el('option', { value: s, text: t('status.' + s) })));

  function statusText(c) {
    const s = t('status.' + (c.status || 'unknown'));
    return c.statusUpdated ? t('statusAsOf', { s, d: c.statusUpdated }) : t('statusNone', { s });
  }

  function render() {
    const rows = filterCenters(centers, { query: search.value, barangay: select.value, status: statusSel.value });
    clear(list);
    count.textContent = t('dir.count', { n: rows.length, total: centers.length });
    if (!rows.length) {
      list.append(el('p', { class: 'empty', text: t('dir.empty') }));
      return;
    }
    rows.forEach(c => list.append(card(c)));
  }

  function card(c) {
    const typeKey = 'type.' + c.type;
    const typeText = t(typeKey) === typeKey ? c.type : t(typeKey);
    const facts = [
      [t('type'), typeText],
      [t('status'), statusText(c)],
      [t('capacity'), c.capacity ? t('capacity.people', { n: c.capacity }) : t('notProvided')],
      [t('facilities'), c.facilities.length ? c.facilities.join(', ') : t('notProvided')],
      [t('lastVerified'), c.lastVerified || t('notVerified')]
    ];
    const url = mapSearchUrl(c, areaName);
    return el('article', { class: 'card center' },
      el('header', {},
        el('h3', { text: c.name }),
        el('span', { class: 'chip', text: c.barangay }),
        el('span', { class: `chip st-${c.status || 'unknown'}`, text: t('status.' + (c.status || 'unknown')) }),
        c.sample ? el('span', { class: 'chip chip-warn', text: t('sample') }) : null),
      el('dl', {}, facts.map(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])),
      c.routeNote ? el('p', { class: 'note', text: c.routeNote }) : null,
      url ? el('a', { class: 'maplink', href: url, target: '_blank', rel: 'noopener noreferrer', text: t('findMap') }) : null);
  }

  search.addEventListener('input', render);
  select.addEventListener('change', render);
  statusSel.addEventListener('change', render);
  render();
}
