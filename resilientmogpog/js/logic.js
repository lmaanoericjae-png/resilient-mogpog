// Pure functions (no DOM) so they can be unit tested in Node.

export function filterCenters(centers, { query = '', barangay = '' } = {}) {
  const q = query.trim().toLowerCase();
  return centers.filter(c => {
    if (barangay && c.barangay !== barangay) return false;
    if (!q) return true;
    return [c.name, c.barangay, c.type, ...(c.facilities || [])]
      .join(' ').toLowerCase().includes(q);
  });
}

export function uniqueBarangays(centers) {
  return [...new Set(centers.map(c => c.barangay))].sort((a, b) => a.localeCompare(b));
}

export function getAdvisory(rules, typeId, levelId, exposureId) {
  const type = rules.warningTypes.find(t => t.id === typeId);
  if (!type) return null;
  const level = type.levels.find(l => l.id === levelId);
  if (!level) return null;
  const exposure = rules.exposureTypes.find(e => e.id === exposureId);
  const base = level.severity;
  const adj = (rules.exposureEscalation[typeId] || {})[exposureId] || 0;
  const severity = base > 0 ? Math.min(rules.maxSeverity, base + adj) : 0;
  const action = rules.actions[String(severity)];
  const escalated = severity > base;
  let explanation = `${type.label}: ${level.label} sets a base level of ${base}.`;
  if (escalated && exposure) {
    explanation += ` Because you are in "${exposure.label}", the advice is raised to level ${severity}.`;
  } else if (exposure && base > 0) {
    explanation += ` Your location type ("${exposure.label}") does not raise it further for this warning.`;
  }
  return {
    severity,
    base,
    escalated,
    label: action.label,
    tone: action.tone,
    steps: action.steps,
    exposureNote: exposure && base > 0 ? exposure.note : '',
    explanation
  };
}

export function checklistProgress(groups, checked) {
  const ids = groups.flatMap(g => g.items.map(i => i.id));
  const done = ids.filter(id => checked[id]).length;
  return { done, total: ids.length, percent: ids.length ? Math.round(done / ids.length * 100) : 0 };
}
