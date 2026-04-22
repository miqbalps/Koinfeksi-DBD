import { inferenceEngine } from './inference.js';
import {
  CLINICAL_GROUP_DEFS,
  HYPOTHESIS_DISPLAY,
  HYPOTHESIS_NAMES,
  LIKELIHOOD,
  LIKELIHOOD_DISPLAY_OVERRIDE,
  SYMPTOMS,
  SYMPTOMS_EN
} from './data.js';

let selectedSymptoms = new Set();

function initApp() {
  renderClinicalInputs();
  renderClinicalTable();
  applyHypothesisLabels();
  setupEventListeners();
  updateUI();
}

function setupEventListeners() {
  const clinicalInputs = document.getElementById('clinicalInputs');
  if (!clinicalInputs) return;

  clinicalInputs.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.type !== 'checkbox') return;

    const symptomCode = target.dataset.symptom;
    if (!symptomCode) return;

    if (target.checked) selectedSymptoms.add(symptomCode);
    else selectedSymptoms.delete(symptomCode);

    updateUI();
  });
}

function updateUI() {
  const countEl = document.getElementById('selectedCount');
  if (countEl) countEl.textContent = String(selectedSymptoms.size);

  const messageEl = document.getElementById('analysisMessage');
  if (messageEl) messageEl.textContent = '';
}

window.resetDiagnosis = function resetDiagnosis() {
  selectedSymptoms.clear();

  document.querySelectorAll('input[type="checkbox"][data-symptom]').forEach((cb) => {
    cb.checked = false;
  });

  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) resultsSection.classList.add('hidden');

  setMessage('');
  updateUI();
};

window.runAnalysis = function runAnalysis() {
  if (selectedSymptoms.size === 0) {
    setMessage('Pilih minimal 1 gejala untuk dianalisis.');
    return;
  }

  const selected = Array.from(selectedSymptoms);
  const rawResult = inferenceEngine.diagnose(selected);
  const formatted = inferenceEngine.formatResult(rawResult);

  renderResult({ formatted, rawValues: formatted.rawValues, selected });

  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

function setMessage(text) {
  const messageEl = document.getElementById('analysisMessage');
  if (messageEl) messageEl.textContent = text;
}

function codeNumber(code) {
  const m = /^\D*(\d+)$/.exec(code);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

function getAllSymptomCodes() {
  const codes = new Set([...Object.keys(SYMPTOMS), ...Object.keys(LIKELIHOOD)]);
  return Array.from(codes).sort((a, b) => codeNumber(a) - codeNumber(b));
}

function getGroupDefForCode(code) {
  const n = codeNumber(code);
  const def = CLINICAL_GROUP_DEFS.find((d) => n >= d.min && n <= d.max);
  return def || CLINICAL_GROUP_DEFS[0];
}

function getParameterLabel(code) {
  const idLabel = SYMPTOMS[code];
  const enLabel = SYMPTOMS_EN?.[code];

  if (idLabel && enLabel) return `${idLabel} (${enLabel})`;
  if (idLabel) return idLabel;
  return code;
}

function formatPercent(p) {
  if (typeof p !== 'number' || Number.isNaN(p)) return '-';
  if (p === 0) return '0%';
  // 0.001 dianggap "tidak tersedia"
  if (p <= 0.001) return '-';
  return `${(p * 100).toFixed(2)}%`.replace(/\.00%$/, '%');
}

function applyHypothesisLabels() {
  const h1 = document.getElementById('hypLabelH1');
  const h2 = document.getElementById('hypLabelH2');
  const h3 = document.getElementById('hypLabelH3');

  if (h1) h1.textContent = HYPOTHESIS_DISPLAY.H1 || 'H1';
  if (h2) h2.textContent = HYPOTHESIS_DISPLAY.H2 || 'H2';
  if (h3) h3.textContent = HYPOTHESIS_DISPLAY.H3 || 'H3';
}

function toDisplayHypothesisName(internalName) {
  const key = Object.entries(HYPOTHESIS_NAMES).find(([, v]) => v === internalName)?.[0];
  if (!key) return internalName;
  return HYPOTHESIS_DISPLAY[key] || internalName;
}

function renderClinicalInputs() {
  const container = document.getElementById('clinicalInputs');
  if (!container) return;

  container.replaceChildren();

  const allCodes = getAllSymptomCodes();
  const byGroup = new Map();
  for (const def of CLINICAL_GROUP_DEFS) byGroup.set(def.key, []);

  for (const code of allCodes) {
    const def = getGroupDefForCode(code);
    const arr = byGroup.get(def.key);
    if (arr) arr.push(code);
  }

  for (const def of CLINICAL_GROUP_DEFS) {
    const card = document.createElement('div');
    card.className =
      'bg-surface-container-low p-8 rounded-xl border border-outline-variant/15 flex flex-col h-full shadow-sm';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between gap-3 mb-6';

    const title = document.createElement('h2');
    title.className = 'text-xl font-headline font-bold';
    title.textContent = def.label;

    const badge = document.createElement('span');
    badge.className =
      'text-[11px] font-bold uppercase tracking-widest text-outline bg-surface-container-lowest px-3 py-1 rounded-full border border-outline-variant/15';
    badge.textContent = `${(byGroup.get(def.key) || []).length} item`;

    header.append(title, badge);

    const list = document.createElement('div');
    list.className = 'space-y-3';

    const codes = byGroup.get(def.key) || [];
    for (const code of codes) {
      const label = document.createElement('label');
      label.className =
        'group flex items-center gap-4 cursor-pointer p-3 hover:bg-surface-container-lowest rounded-lg transition-colors';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.symptom = code;
      input.className =
        'w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20';
      input.checked = selectedSymptoms.has(code);

      const span = document.createElement('span');
      span.className =
        'text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors';
      span.textContent = `${code}: ${getParameterLabel(code)}`;

      label.append(input, span);
      list.appendChild(label);
    }

    card.append(header, list);
    container.appendChild(card);
  }
}

function renderClinicalTable() {
  const thead = document.getElementById('clinicalTableHead');
  const tbody = document.getElementById('clinicalTableBody');
  if (!thead || !tbody) return;

  thead.replaceChildren();
  tbody.replaceChildren();

  const hypothesisKeys = ['H1', 'H2', 'H3'].filter((k) => k in HYPOTHESIS_NAMES);

  const headTr = document.createElement('tr');

  const thCode = document.createElement('th');
  thCode.className = 'text-left py-3 px-3 whitespace-nowrap';
  thCode.textContent = 'Kode';

  const thParam = document.createElement('th');
  thParam.className = 'text-left py-3 px-3 min-w-[280px]';
  thParam.textContent = 'Parameter Klinis';

  headTr.append(thCode, thParam);

  for (const hk of hypothesisKeys) {
    const th = document.createElement('th');
    th.className = 'text-right py-3 px-3 whitespace-nowrap';
    th.textContent = HYPOTHESIS_DISPLAY[hk] || hk;
    headTr.appendChild(th);
  }

  thead.appendChild(headTr);

  const allCodes = getAllSymptomCodes();
  const roman = ['I', 'II', 'III', 'IV', 'V'];

  for (let i = 0; i < CLINICAL_GROUP_DEFS.length; i += 1) {
    const def = CLINICAL_GROUP_DEFS[i];
    const groupCodes = allCodes.filter((c) => getGroupDefForCode(c).key === def.key);

    if (groupCodes.length === 0) continue;

    const groupTr = document.createElement('tr');
    const groupTd = document.createElement('td');
    groupTd.colSpan = 2 + hypothesisKeys.length;
    groupTd.className =
      'py-3 px-3 text-xs font-bold uppercase tracking-widest text-outline bg-surface-container-lowest';
    groupTd.textContent = `${roman[i] || ''} ${def.label}`.trim();
    groupTr.appendChild(groupTd);
    tbody.appendChild(groupTr);

    for (const code of groupCodes) {
      const tr = document.createElement('tr');

      const tdCode = document.createElement('td');
      tdCode.className = 'py-3 px-3 font-mono text-xs text-on-surface whitespace-nowrap';
      tdCode.textContent = code;

      const tdParam = document.createElement('td');
      tdParam.className = 'py-3 px-3 text-on-surface-variant';
      tdParam.textContent = getParameterLabel(code);

      tr.append(tdCode, tdParam);

      const likelihoodArr = LIKELIHOOD[code];
      const overrideArr = LIKELIHOOD_DISPLAY_OVERRIDE?.[code];

      for (let idx = 0; idx < hypothesisKeys.length; idx += 1) {
        let v = likelihoodArr?.[idx];
        if (overrideArr && overrideArr[idx] !== null && overrideArr[idx] !== undefined) {
          v = overrideArr[idx];
        }

        const td = document.createElement('td');
        td.className = 'py-3 px-3 text-right font-mono text-xs text-on-surface';
        td.textContent = formatPercent(v);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }
  }
}

function formatNumber(num) {
  if (typeof num !== 'number' || Number.isNaN(num)) return '-';
  if (!Number.isFinite(num)) return String(num);
  if (num === 0) return '0';
  if (Math.abs(num) < 0.001) return num.toExponential(3);
  return num
    .toFixed(6)
    .replace(/\.0+$/, '')
    .replace(/(\.[0-9]*?)0+$/, '$1');
}

function renderResult({ formatted, rawValues, selected }) {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) resultsSection.classList.remove('hidden');

  const diagnosisText = document.getElementById('diagnosisText');
  const confidenceText = document.getElementById('confidenceText');
  if (diagnosisText) diagnosisText.textContent = toDisplayHypothesisName(formatted.diagnosis);
  if (confidenceText) confidenceText.textContent = `${formatted.confidence}%`;

  const probH1 = document.getElementById('probH1');
  const probH2 = document.getElementById('probH2');
  const probH3 = document.getElementById('probH3');
  if (probH1) probH1.textContent = `${Number(formatted.probabilities.dengue).toFixed(2)}%`;
  if (probH2) probH2.textContent = `${Number(formatted.probabilities.tifoid).toFixed(2)}%`;
  if (probH3) probH3.textContent = `${Number(formatted.probabilities.malaria).toFixed(2)}%`;

  // Rule Based
  const ruleStatus = document.getElementById('ruleStatus');
  const ruleDescription = document.getElementById('ruleDescription');
  if (formatted.ruleMatched) {
    if (ruleStatus) ruleStatus.textContent = `Aturan terpenuhi: ${toDisplayHypothesisName(formatted.ruleMatched)}`;
    if (ruleDescription) ruleDescription.textContent = formatted.ruleDescription || '';
  } else {
    if (ruleStatus) ruleStatus.textContent = 'Tidak ada aturan yang terpenuhi.';
    if (ruleDescription) ruleDescription.textContent = 'Hasil akhir ditentukan dari probabilitas Bayes tertinggi.';
  }

  // Selected symptoms list
  const listEl = document.getElementById('selectedSymptomsList');
  if (listEl) {
    listEl.replaceChildren();
    selected
      .slice()
      .sort((a, b) => codeNumber(a) - codeNumber(b))
      .forEach((code) => {
        const li = document.createElement('li');
        li.textContent = `${code}: ${getParameterLabel(code)}`;
        listEl.appendChild(li);
      });
  }

  // Bayes steps + raw values
  const bayesStepsEl = document.getElementById('bayesSteps');
  if (bayesStepsEl) {
    bayesStepsEl.textContent = [
      `H1: ${formatted.steps.H1}`,
      `H2: ${formatted.steps.H2}`,
      `H3: ${formatted.steps.H3}`
    ].join('\n');
  }

  const rawH1 = document.getElementById('rawH1');
  const rawH2 = document.getElementById('rawH2');
  const rawH3 = document.getElementById('rawH3');
  const rawTotal = document.getElementById('rawTotal');
  if (rawH1) rawH1.textContent = formatNumber(rawValues.H1);
  if (rawH2) rawH2.textContent = formatNumber(rawValues.H2);
  if (rawH3) rawH3.textContent = formatNumber(rawValues.H3);
  if (rawTotal) rawTotal.textContent = formatNumber(rawValues.total);
}

document.addEventListener('DOMContentLoaded', initApp);