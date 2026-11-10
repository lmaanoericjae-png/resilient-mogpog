import { $ } from './dom.js';
import { initDirectory } from './directory.js';
import { initAdvisory } from './advisory.js';
import { initHub } from './hub.js';

const get = f => fetch(`data/${f}.json`).then(r => {
  if (!r.ok) throw new Error(`${f}: ${r.status}`);
  return r.json();
});

async function main() {
  try {
    const [config, centers, rules, hotlines, checklist] = await Promise.all(
      ['config', 'evacuation-centers', 'advisory-rules', 'hotlines', 'checklist'].map(get));
    document.title = `${config.appName} · ${config.areaName}`;
    $('#app-name').textContent = config.appName;
    $('#area-name').textContent = `${config.tagline} for ${config.areaName}`;
    $('#data-notice').textContent = `${config.dataNotice} Data last updated ${config.dataLastUpdated}.`;
    initDirectory(centers);
    initAdvisory(rules);
    initHub(checklist, hotlines);
  } catch (err) {
    $('#load-error').hidden = false;
    $('#load-error').textContent = 'Could not load data files. If you opened index.html directly, run a local server (see README). ' + err.message;
  }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  const tabs = [...document.querySelectorAll('[role=tab]')];
  function show(id) {
    tabs.forEach(t => {
      const on = t.dataset.panel === id;
      t.setAttribute('aria-selected', on);
      $('#' + t.dataset.panel).hidden = !on;
    });
    try { history.replaceState(null, '', '#' + id); } catch {}
  }
  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.panel)));
  const start = location.hash.slice(1);
  show(tabs.some(t => t.dataset.panel === start) ? start : 'panel-directory');
}
main();
