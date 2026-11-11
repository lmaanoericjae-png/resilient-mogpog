import { $ } from './dom.js';
import { initDirectory } from './directory.js';
import { initAdvisory } from './advisory.js';
import { initHub } from './hub.js';
import { initPlan } from './plan.js';
import { initI18n, applyStatic, setLang, lang, t, tryT, localizeRules, localizeChecklist, localizeHotlines } from './i18n.js';

const get = f => fetch(`data/${f}.json`).then(r => {
  if (!r.ok) throw new Error(`${f}: ${r.status}`);
  return r.json();
});

async function main() {
  await initI18n();
  applyStatic();
  $('#lang-toggle').addEventListener('click', () => setLang(lang === 'fil' ? 'en' : 'fil'));
  try {
    const [config, centers, rules, hotlines, checklist] = await Promise.all(
      ['config', 'evacuation-centers', 'advisory-rules', 'hotlines', 'checklist'].map(get));
    document.title = `${config.appName} · ${config.areaName}`;
    $('#app-name').textContent = config.appName;
    $('#area-name').textContent = `${config.tagline} · ${config.areaName}`;
    $('#data-notice').textContent = `${tryT('notice', config.dataNotice)} ${t('updated', { d: config.dataLastUpdated })}`;
    initDirectory(centers, config.areaName);
    initAdvisory(localizeRules(rules));
    initHub(localizeChecklist(checklist), localizeHotlines(hotlines));
    initPlan(centers);
  } catch (err) {
    $('#load-error').hidden = false;
    $('#load-error').textContent = t('loadError') + ' ' + err.message;
  }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  const tabs = [...document.querySelectorAll('[role=tab]')];
  function show(id) {
    tabs.forEach(tb => {
      const on = tb.dataset.panel === id;
      tb.setAttribute('aria-selected', on);
      $('#' + tb.dataset.panel).hidden = !on;
    });
    try { history.replaceState(null, '', '#' + id); } catch {}
  }
  tabs.forEach(tb => tb.addEventListener('click', () => show(tb.dataset.panel)));
  const start = location.hash.slice(1);
  show(tabs.some(tb => tb.dataset.panel === start) ? start : 'panel-directory');
}
main();
