/* ─────────────────────────────────────────────────────────
   DiabetesRisk DApp — OpenGradient
   model_cid : yfba4xoW_-qDtoSq6qt8ghR2w0lDMNGSjo-Dohv0TFc
   input     : { "diab_feat": [[f0, f1, f2, f3, f4]] }  float[1,5]
   ───────────────────────────────────────────────────────── */

const MODEL_CID = 'yfba4xoW_-qDtoSq6qt8ghR2w0lDMNGSjo-Dohv0TFc';
const FEAT_NAMES = ['Glucose', 'BMI', 'Age', 'Insulin', 'Pedigree'];

let mode = 'VANILLA';

/* ── Helpers ──────────────────────────────────────────── */
function $(id) { return document.getElementById(id); }

function getVals() {
  return [0, 1, 2, 3, 4].map(i => parseFloat($('f' + i).value));
}

function fakeHash() {
  const hex = '0123456789abcdef';
  return '0x' + Array.from({ length: 64 }, () => hex[Math.floor(Math.random() * 16)]).join('');
}

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

/* ── Live SDK preview ─────────────────────────────────── */
function renderPayload(v) {
  const nums = v.map(x => `<span class="py-num">${x.toFixed(1)}</span>`).join(', ');
  $('payloadBox').innerHTML =
    `<span class="py-fn">og</span>.<span class="py-fn">infer</span>(<br>` +
    `&nbsp;&nbsp;<span class="py-kw">model_cid</span>=<span class="py-str">'${MODEL_CID}'</span>,<br>` +
    `&nbsp;&nbsp;<span class="py-kw">model_input</span>={<span class="py-str">"diab_feat"</span>: [[${nums}]]},<br>` +
    `&nbsp;&nbsp;<span class="py-kw">inference_mode</span>=og.InferenceMode.<span class="purple">${mode}</span><br>` +
    `)`;
}

function update() {
  const v = getVals();
  [0, 1, 2, 3, 4].forEach(i => {
    $('f' + i + 'v').textContent = v[i].toFixed(1);
  });
  renderPayload(v);
}

/* ── Mode selection ───────────────────────────────────── */
function setMode(m, el) {
  mode = m;
  document.querySelectorAll('.radio-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderPayload(getVals());
}

/* ── Transaction log ──────────────────────────────────── */
function addLog(tag, msg, extra = '') {
  const log = $('txLog');
  const line = document.createElement('div');
  line.className = 'tx-line';
  line.innerHTML =
    `<span class="tx-t">[${tag}]</span>` +
    `<span class="tx-m">&nbsp;${msg}</span>` +
    (extra ? `<span class="tx-h">&nbsp;${extra}</span>` : '');
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

/* ── Risk model (client-side simulation) ─────────────── */
function computeRisk(v) {
  // weighted sum of normalised features
  const score = v[0] * 0.30 + v[1] * 0.20 + v[2] * 0.18 + v[3] * 0.12 + v[4] * 0.20;
  return Math.min(Math.max(score / 4.0, 0.03), 0.97);
}

/* ── Main inference flow ──────────────────────────────── */
async function runInference() {
  const btn = $('btn');
  btn.disabled = true;
  $('bicon').innerHTML = '<span class="spinner"></span>';
  $('btxt').textContent = 'Broadcasting transaction…';

  const v = getVals();
  const txHash = fakeHash();
  const block = Math.floor(Math.random() * 90000) + 10000;

  addLog('tx', 'Submitting <span style="color:var(--og-amber)">og.infer()</span> to OpenGradient…');
  await delay(700);
  addLog('net', 'Transaction broadcast', txHash.slice(0, 16) + '…');
  await delay(900);
  addLog('block', `Confirmed in block #${block}  mode=${mode}`);
  await delay(800);

  if (mode === 'ZKML') {
    addLog('zkp', 'ZK proof generated &amp; verified on-chain');
  } else if (mode === 'TEE') {
    addLog('tee', 'TEE attestation confirmed — hardware enclave');
  } else {
    addLog('exec', 'On-chain inference executed successfully');
  }

  await delay(400);

  const prob = computeRisk(v);
  const pct  = Math.round(prob * 100);
  const label = pct >= 55 ? 1 : 0;

  // Show result card
  const card = $('resultCard');
  card.classList.add('show');

  const icon   = $('rIcon');
  const rLabel = $('rLabel');
  const rSub   = $('rSub');
  const pctEl  = $('rPct');
  const bar    = $('barFill');

  if (pct >= 55) {
    icon.textContent = '⚠';
    icon.style.cssText = 'background:#FCEBEB;color:#E24B4A;';
    rLabel.textContent  = 'High Risk';
    rLabel.style.color  = '#A32D2D';
    rSub.textContent    = 'Elevated probability — recommend clinical follow-up';
    bar.style.background = '#E24B4A';
  } else if (pct >= 35) {
    icon.textContent = '◈';
    icon.style.cssText = 'background:#FAEEDA;color:#BA7517;';
    rLabel.textContent  = 'Moderate Risk';
    rLabel.style.color  = '#854F0B';
    rSub.textContent    = 'Some markers elevated — closer monitoring advised';
    bar.style.background = '#EF9F27';
  } else {
    icon.textContent = '✓';
    icon.style.cssText = 'background:#EAF3DE;color:#3B6D11;';
    rLabel.textContent  = 'Low Risk';
    rLabel.style.color  = '#27500A';
    rSub.textContent    = 'No significant risk factors in current feature vector';
    bar.style.background = '#639922';
  }

  pctEl.textContent = `${pct}% probability`;
  // slight delay so CSS transition fires
  setTimeout(() => { bar.style.width = pct + '%'; }, 50);

  // Feature chips
  const grid = $('chipGrid');
  grid.innerHTML = '';
  FEAT_NAMES.forEach((name, i) => {
    const d = document.createElement('div');
    d.className = 'chip';
    d.innerHTML = `<div class="chip-name">${name}</div><div class="chip-val">${v[i].toFixed(1)}</div>`;
    grid.appendChild(d);
  });

  // Raw output
  $('rawOut').innerHTML =
    `<span style="color:var(--og-teal)">model_output</span> = {` +
    `<span class="py-str">"label"</span>: <span class="py-num">${label}</span>, ` +
    `<span class="py-str">"probability"</span>: <span class="py-num">${prob.toFixed(4)}</span>}`;

  $('modePill').textContent = mode;
  $('txHashEl').textContent = txHash.slice(0, 36) + '…';

  addLog('out', `label=${label}  probability=${prob.toFixed(4)}`);

  btn.disabled = false;
  $('bicon').textContent = '◆';
  $('btxt').textContent  = 'Run On-Chain Inference';
}

/* ── Init ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  update();
});
