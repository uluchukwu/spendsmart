/* ════════════════════════════════════════════════════════
   SpendSmart — Expense Tracker  |  app.js
   Base currency: GBP (£)  |  Display: GBP or NGN
   ════════════════════════════════════════════════════════ */

// ── Constants ──────────────────────────────────────────────
const STORAGE_KEY      = 'spendsmart_expenses';
const RATE_STORAGE_KEY = 'spendsmart_rate';
const FALLBACK_RATE    = 2050;

const CATEGORY_ICONS = {
  Food:'🍔', Transport:'🚗', Shopping:'🛍️',
  Entertainment:'🎬', Health:'💊', Bills:'⚡', Education:'📚', Others:'💼',
};
const CHART_COLORS = {
  Food:'#ff6b6b', Transport:'#ffa502', Shopping:'#a29bfe',
  Entertainment:'#fd79a8', Health:'#00cec9', Bills:'#fdcb6e',
  Education:'#74b9ff', Others:'#636e72',
};
const ALL_TIPS = [
  'Follow the 50/30/20 rule: 50% on needs, 30% on wants, 20% on savings or debt repayment.',
  'Track every purchase — small daily expenses add up to thousands monthly.',
  'Build a 3–6 month emergency fund before investing.',
  'Meal-prep at home 4–5 days a week. Eating out is often 3–5× more expensive.',
  'Review your subscriptions every month. Cancel any you haven\'t used in 30 days.',
  'Avoid impulse purchases by applying the 24-hour rule before buying non-essentials.',
  'Pay yourself first: automate a fixed savings transfer on payday.',
  'Use a debit card instead of credit — it makes you more conscious of cost.',
  'Compare prices before buying electronics or appliances. Gaps can be 20–40%.',
  'Set a weekly spending cap per category and stop when you reach it.',
  'Buy non-perishables in bulk (rice, toiletries) to save long-term.',
  'The best time to shop for clothes is during end-of-season clearance sales.',
  'Review your mobile data plan regularly — you may be overpaying.',
  'Try the envelope method: divide your budget into labelled cash envelopes each month.',
  'Cut transport costs by carpooling, public transit, or combining errands into one trip.',
  'Avoid grocery shopping when hungry — it leads to buying more than planned.',
  'Negotiate recurring bills (internet, insurance) at least once a year.',
  'Invest the money you save from cutting expenses rather than spending the difference.',
  'Ask yourself before every purchase: "Do I need this, or do I just want it?"',
  'Use your expense data to find your top spending category and set a reduction goal.',
  'Financial goals work better when specific: "Save £500 by June" beats "save more money".',
  'Having both GBP and NGN visibility helps you make smarter decisions across both economies.',
  'Use the itemized list feature to see exactly where your money goes within each shopping trip.',
  'Tracking individual items helps spot unnecessary purchases before they become habits.',
];

// ── State ──────────────────────────────────────────────────
let expenses        = loadExpenses();
let activePeriod    = 'day';
let editingId       = null;
let deleteTarget    = null;
let chart           = null;
let shownTips       = [];
let displayCurrency = 'GBP';
let gbpToNgn        = loadCachedRate();
let rateIsCustom    = false;
let rateFetching    = false;
let rateUpdatedAt   = null;

// ── Storage ────────────────────────────────────────────────
function loadExpenses() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}
function loadCachedRate() {
  try {
    const cached = JSON.parse(localStorage.getItem(RATE_STORAGE_KEY));
    if (cached?.rate && cached?.ts) { rateUpdatedAt = new Date(cached.ts); return cached.rate; }
  } catch {}
  return FALLBACK_RATE;
}
function saveCachedRate(rate) {
  localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify({ rate, ts: Date.now() }));
}

// ── Currency helpers ───────────────────────────────────────
function fmtGBP(n) { return '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function fmtNGN(n) { return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function fmtDisplay(gbpAmt) { return displayCurrency === 'NGN' ? fmtNGN(gbpAmt * gbpToNgn) : fmtGBP(gbpAmt); }
function fmtAlt(gbpAmt)     { return displayCurrency === 'NGN' ? fmtGBP(gbpAmt) : fmtNGN(gbpAmt * gbpToNgn); }
function altLabel()         { return displayCurrency === 'GBP' ? '≈' : '≈'; }

// ── Live Rate Fetch ────────────────────────────────────────
async function fetchLiveRate() {
  if (rateFetching) return;
  rateFetching = true;
  setRateStatus('fetching', 'Fetching live rate…');
  const endpoints = [
    async () => { const r = await fetch('https://open.er-api.com/v6/latest/GBP'); const j = await r.json(); if (j.result==='success'&&j.rates?.NGN) return j.rates.NGN; throw 0; },
    async () => { const r = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/gbp.json'); const j = await r.json(); if (j.gbp?.ngn) return j.gbp.ngn; throw 0; },
  ];
  for (const fn of endpoints) {
    try {
      gbpToNgn = await fn(); rateIsCustom = false; rateUpdatedAt = new Date();
      saveCachedRate(gbpToNgn); updateRateBar(); render(); rateFetching = false; return;
    } catch {}
  }
  rateFetching = false;
  setRateStatus('error', 'Could not fetch — using cached rate');
  updateRateBar(true);
}
function setRateStatus(type, msg) {
  document.getElementById('rateDot').className    = 'rate-dot ' + type;
  document.getElementById('rateStatus').textContent = msg;
}
function updateRateBar(error = false) {
  document.getElementById('rateValue').textContent =
    Number(gbpToNgn).toLocaleString('en-NG', { minimumFractionDigits:2, maximumFractionDigits:2 });
  if (rateIsCustom) { setRateStatus('custom', 'Custom rate applied'); }
  else if (!error && rateUpdatedAt) {
    const mins = Math.round((Date.now() - rateUpdatedAt.getTime()) / 60000);
    setRateStatus('live', 'Live · Updated ' + (mins === 0 ? 'just now' : mins === 1 ? '1 min ago' : mins + ' mins ago'));
  }
  updateConverterNote();
  // Recalculate itemised total if open
  if (document.getElementById('itemizedSection').classList.contains('visible')) recalcItems();
}

// ── Currency Toggle ────────────────────────────────────────
document.querySelectorAll('.cur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.cur === displayCurrency) return;
    document.querySelectorAll('.cur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    displayCurrency = btn.dataset.cur;
    render();
  });
});

// ── Utilities ──────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function today() { return new Date().toISOString().slice(0,10); }
function startOfWeek()  { const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().slice(0,10); }
function startOfMonth() { const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10); }
function filterByPeriod(list, period) {
  const t=today(),w=startOfWeek(),m=startOfMonth();
  if (period==='day')   return list.filter(e=>e.date===t);
  if (period==='week')  return list.filter(e=>e.date>=w);
  if (period==='month') return list.filter(e=>e.date>=m);
  return list;
}
function formatDateLabel(dateStr) {
  const d=new Date(dateStr+'T00:00:00'), tod=today();
  const yd=new Date(); yd.setDate(yd.getDate()-1);
  if (dateStr===tod) return 'Today';
  if (dateStr===yd.toISOString().slice(0,10)) return 'Yesterday';
  return d.toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'short',day:'numeric'});
}
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Period tabs ────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    activePeriod = tab.dataset.period;
    render();
  });
});

// ── Summary ────────────────────────────────────────────────
function updateSummary(list) {
  const total = list.reduce((s,e)=>s+e.amount,0);
  const days  = Math.max([...new Set(list.map(e=>e.date))].length, 1);
  const avg   = total / days;
  let biggest = { amount:0, item:'—' };
  list.forEach(e=>{ if(e.amount>biggest.amount) biggest=e; });

  document.getElementById('totalSpent').textContent    = fmtDisplay(total);
  document.getElementById('totalSpentAlt').textContent = fmtAlt(total);
  document.getElementById('txCount').textContent       = list.length + ' transaction' + (list.length!==1?'s':'');
  document.getElementById('dailyAvg').textContent      = fmtDisplay(avg);
  document.getElementById('dailyAvgAlt').textContent   = fmtAlt(avg);
  document.getElementById('biggestExp').textContent    = fmtDisplay(biggest.amount);
  document.getElementById('biggestExpAlt').textContent = fmtAlt(biggest.amount);
  document.getElementById('biggestName').textContent   = biggest.item || '—';
}

// ── Chart ──────────────────────────────────────────────────
function updateChart(list) {
  const canvas  = document.getElementById('categoryChart');
  const empty   = document.getElementById('chartEmpty');
  const totals  = {};
  list.forEach(e=>{ totals[e.category]=(totals[e.category]||0)+e.amount; });
  const labels  = Object.keys(totals);
  const data    = Object.values(totals).map(v=>displayCurrency==='NGN'?v*gbpToNgn:v);
  if (!labels.length) {
    canvas.style.display='none'; empty.style.display='block';
    if (chart) { chart.destroy(); chart=null; } return;
  }
  canvas.style.display='block'; empty.style.display='none';
  const colors = labels.map(l=>CHART_COLORS[l]||'#636e72');
  const sym    = displayCurrency==='GBP'?'£':'₦';
  const tot    = data.reduce((a,b)=>a+b,0);
  if (chart) chart.destroy();
  chart = new Chart(canvas, {
    type:'doughnut',
    data:{ labels, datasets:[{ data, backgroundColor:colors, borderWidth:2, borderColor:'#1a1d27', hoverOffset:6 }] },
    options:{
      cutout:'62%',
      plugins:{
        legend:{ position:'bottom', labels:{ color:'#8b90b8', font:{size:11}, padding:10, boxWidth:12, boxHeight:12 } },
        tooltip:{ callbacks:{ label:ctx=>' '+sym+Number(ctx.raw).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})+' ('+Math.round(ctx.raw/tot*100)+'%)' } },
      },
    },
  });
}

// ── Expense List ───────────────────────────────────────────
function applyFiltersAndSort(list) {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const catF   = document.getElementById('categoryFilter').value;
  const sort   = document.getElementById('sortSelect').value;
  let out = list.filter(e=>{
    const ms = e.item.toLowerCase().includes(search)||(e.notes||'').toLowerCase().includes(search);
    return ms && (catF==='all'||e.category===catF);
  });
  out.sort((a,b)=>{
    if (sort==='date-desc')   return b.date.localeCompare(a.date)||b.ts-a.ts;
    if (sort==='date-asc')    return a.date.localeCompare(b.date)||a.ts-b.ts;
    if (sort==='amount-desc') return b.amount-a.amount;
    if (sort==='amount-asc')  return a.amount-b.amount;
    return 0;
  });
  return out;
}

function renderList(list) {
  const container  = document.getElementById('expenseList');
  const emptyState = document.getElementById('emptyState');
  if (!list.length) {
    container.innerHTML=''; container.appendChild(emptyState);
    emptyState.style.display='flex'; return;
  }
  emptyState.style.display='none';

  const groups = {};
  list.forEach(e=>{ (groups[e.date]=groups[e.date]||[]).push(e); });
  const sortedDates = Object.keys(groups).sort((a,b)=>
    document.getElementById('sortSelect').value==='date-asc'?a.localeCompare(b):b.localeCompare(a)
  );

  container.innerHTML = '';
  sortedDates.forEach(date=>{
    const dayGBP = groups[date].reduce((s,e)=>s+e.amount,0);
    const hdr    = document.createElement('div');
    hdr.className = 'date-group-header';
    hdr.textContent = formatDateLabel(date) + '  —  ' + fmtDisplay(dayGBP) + '  (' + fmtAlt(dayGBP) + ')';
    container.appendChild(hdr);

    groups[date].forEach(e=>{
      const hasItems = e.items && e.items.length > 0;
      const row = document.createElement('div');
      row.className = 'expense-item';
      row.innerHTML = `
        <div class="exp-icon icon-${e.category}">${CATEGORY_ICONS[e.category]||'💼'}</div>
        <div class="exp-details">
          <div class="exp-name">${escHtml(e.item)}</div>
          <div class="exp-meta">
            <span class="exp-category cat-${e.category}">${e.category}</span>
            ${hasItems ? `<span class="items-badge">📋 ${e.items.length} item${e.items.length!==1?'s':''}</span>` : ''}
            ${e.notes ? '<span>' + escHtml(e.notes) + '</span>' : ''}
          </div>
        </div>
        <div class="exp-amount-col">
          <div class="exp-amount">${fmtDisplay(e.amount)}</div>
          <div class="exp-amount-alt">${fmtAlt(e.amount)}</div>
        </div>
        <div class="exp-actions">
          <button class="btn-edit"   data-id="${e.id}" title="Edit">✏️</button>
          <button class="btn-delete" data-id="${e.id}" title="Delete">🗑️</button>
        </div>`;

      // Click row → detail view (but not the action buttons)
      row.addEventListener('click', ev=>{
        if (!ev.target.closest('.exp-actions')) openDetail(e.id);
      });
      row.querySelector('.btn-edit').addEventListener('click',   ev=>{ ev.stopPropagation(); openEdit(e.id); });
      row.querySelector('.btn-delete').addEventListener('click', ev=>{ ev.stopPropagation(); openDelete(e.id); });
      container.appendChild(row);
    });
  });
}

// ── Main render ────────────────────────────────────────────
function render() {
  const periodList = filterByPeriod(expenses, activePeriod);
  updateSummary(periodList);
  updateChart(periodList);
  renderList(applyFiltersAndSort(periodList));
  updateConverterNote();
}

['searchInput','categoryFilter','sortSelect'].forEach(id=>{
  document.getElementById(id).addEventListener('input', render);
});

// ══════════════════════════════════════════════════════════
// ITEMIZED ITEM ROWS
// ══════════════════════════════════════════════════════════
function createItemRow(name='', qty=1, price='') {
  const row = document.createElement('div');
  row.className = 'item-row';

  // Name input
  const nameInput = document.createElement('input');
  nameInput.type = 'text'; nameInput.className = 'item-name';
  nameInput.placeholder = 'e.g. Milk 2L'; nameInput.value = name;

  // Qty input
  const qtyInput = document.createElement('input');
  qtyInput.type = 'number'; qtyInput.className = 'item-qty';
  qtyInput.value = qty; qtyInput.min = '0.01'; qtyInput.step = '0.01';

  // Price input (with £ prefix wrapper)
  const priceWrap = document.createElement('div');
  priceWrap.className = 'item-price-wrap';
  const priceSym = document.createElement('span');
  priceSym.className = 'ip-sym'; priceSym.textContent = '£';
  const priceInput = document.createElement('input');
  priceInput.type = 'number'; priceInput.className = 'item-price';
  priceInput.placeholder = '0.00'; priceInput.min = '0'; priceInput.step = '0.01';
  if (price !== '') priceInput.value = price;
  priceWrap.appendChild(priceSym); priceWrap.appendChild(priceInput);

  // Subtotal display
  const subSpan = document.createElement('span');
  subSpan.className = 'item-sub'; subSpan.textContent = '£0.00';

  // Remove button
  const rmBtn = document.createElement('button');
  rmBtn.type = 'button'; rmBtn.className = 'item-rm-btn'; rmBtn.title = 'Remove item';
  rmBtn.textContent = '×';

  row.appendChild(nameInput); row.appendChild(qtyInput);
  row.appendChild(priceWrap); row.appendChild(subSpan); row.appendChild(rmBtn);

  // Event listeners
  qtyInput.addEventListener('input',   () => { updateRowSubtotal(row); recalcItems(); });
  priceInput.addEventListener('input', () => { updateRowSubtotal(row); recalcItems(); });
  rmBtn.addEventListener('click', () => {
    row.remove();
    recalcItems();
    // If no rows left, add a blank one
    const container = document.getElementById('itemRowsContainer');
    if (!container.children.length) addBlankItemRow();
  });

  updateRowSubtotal(row);
  return row;
}

function updateRowSubtotal(row) {
  const qty   = parseFloat(row.querySelector('.item-qty').value)   || 0;
  const price = parseFloat(row.querySelector('.item-price').value) || 0;
  row.querySelector('.item-sub').textContent = fmtGBP(qty * price);
}

function recalcItems() {
  const rows = document.querySelectorAll('#itemRowsContainer .item-row');
  let total = 0;
  rows.forEach(row => {
    const qty   = parseFloat(row.querySelector('.item-qty').value)   || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const sub   = qty * price;
    total += sub;
    row.querySelector('.item-sub').textContent = fmtGBP(sub);
  });
  document.getElementById('itemsGrandTotal').textContent    = fmtGBP(total);
  document.getElementById('itemsGrandTotalNgn').textContent = '≈ ' + fmtNGN(total * gbpToNgn);
}

function addBlankItemRow() {
  const container = document.getElementById('itemRowsContainer');
  container.appendChild(createItemRow());
}

function collectItems() {
  const items = [];
  document.querySelectorAll('#itemRowsContainer .item-row').forEach(row => {
    const name  = row.querySelector('.item-name').value.trim();
    const qty   = parseFloat(row.querySelector('.item-qty').value)   || 1;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    if (name || price > 0) items.push({ name, qty, price });
  });
  return items;
}

function getItemizedTotal() {
  return collectItems().reduce((s,i) => s + i.qty * i.price, 0);
}

function clearItemRows() {
  document.getElementById('itemRowsContainer').innerHTML = '';
  document.getElementById('itemsGrandTotal').textContent    = '£0.00';
  document.getElementById('itemsGrandTotalNgn').textContent = '≈ ₦0.00';
}

// ── Itemized toggle ────────────────────────────────────────
const itemizedToggle    = document.getElementById('itemizedToggle');
const itemizedSection   = document.getElementById('itemizedSection');
const simpleAmountSection = document.getElementById('simpleAmountSection');

itemizedToggle.addEventListener('change', () => {
  if (itemizedToggle.checked) {
    simpleAmountSection.style.display = 'none';
    itemizedSection.classList.add('visible');
    // Start with 3 blank rows if none exist
    if (!document.getElementById('itemRowsContainer').children.length) {
      addBlankItemRow(); addBlankItemRow(); addBlankItemRow();
    }
  } else {
    simpleAmountSection.style.display = 'block';
    itemizedSection.classList.remove('visible');
    // Pre-fill amount from computed total if available
    const tot = getItemizedTotal();
    if (tot > 0) {
      document.getElementById('amount').value = tot.toFixed(2);
      updateAmountConverted(tot);
    }
  }
});

document.getElementById('addItemRowBtn').addEventListener('click', addBlankItemRow);

// ══════════════════════════════════════════════════════════
// ADD / EDIT MODAL
// ══════════════════════════════════════════════════════════
const modalOverlay = document.getElementById('modalOverlay');
const expenseForm  = document.getElementById('expenseForm');

function openModal(id = null) {
  editingId = id;
  document.getElementById('editId').value = id || '';
  document.getElementById('modalTitle').textContent = id ? 'Edit Expense' : 'Add Expense';
  document.getElementById('saveBtn').textContent    = id ? 'Save Changes' : 'Save Expense';

  if (id) {
    const e = expenses.find(x => x.id === id);
    document.getElementById('itemName').value = e.item;
    document.getElementById('category').value = e.category;
    document.getElementById('expDate').value  = e.date;
    document.getElementById('notes').value    = e.notes || '';

    const hasItems = e.items && e.items.length > 0;
    if (hasItems) {
      // Switch to itemized mode
      itemizedToggle.checked = true;
      simpleAmountSection.style.display = 'none';
      itemizedSection.classList.add('visible');
      clearItemRows();
      const container = document.getElementById('itemRowsContainer');
      e.items.forEach(item => container.appendChild(createItemRow(item.name, item.qty, item.price)));
      recalcItems();
    } else {
      // Simple mode
      itemizedToggle.checked = false;
      simpleAmountSection.style.display = 'block';
      itemizedSection.classList.remove('visible');
      document.getElementById('amount').value = e.amount;
      updateAmountConverted(e.amount);
    }
  } else {
    // Reset form for new expense
    expenseForm.reset();
    document.getElementById('expDate').value = today();
    itemizedToggle.checked = false;
    simpleAmountSection.style.display = 'block';
    itemizedSection.classList.remove('visible');
    clearItemRows();
    document.getElementById('amountConverted').textContent = '';
  }

  modalOverlay.classList.add('open');
  setTimeout(() => document.getElementById('itemName').focus(), 50);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  editingId = null;
}

document.getElementById('openModalBtn').addEventListener('click', () => openModal());
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
function openEdit(id) { openModal(id); }

// Live conversion hint while typing amount
document.getElementById('amount').addEventListener('input', () => {
  const v = parseFloat(document.getElementById('amount').value);
  updateAmountConverted(isNaN(v) ? 0 : v);
});
function updateAmountConverted(gbpVal) {
  const el = document.getElementById('amountConverted');
  if (!gbpVal || gbpVal <= 0) { el.textContent = ''; return; }
  el.textContent = '≈ ' + fmtNGN(gbpVal * gbpToNgn) + ' at current rate';
}

// ── Form Submit ────────────────────────────────────────────
expenseForm.addEventListener('submit', e => {
  e.preventDefault();
  const item     = document.getElementById('itemName').value.trim();
  const category = document.getElementById('category').value;
  const date     = document.getElementById('expDate').value;
  const notes    = document.getElementById('notes').value.trim();
  if (!item || !category || !date) return;

  let amount, items;
  if (itemizedToggle.checked) {
    items  = collectItems();
    amount = items.reduce((s, i) => s + i.qty * i.price, 0);
    if (!items.length || amount <= 0) {
      alert('Please add at least one item with a price greater than £0.00'); return;
    }
  } else {
    amount = parseFloat(document.getElementById('amount').value);
    if (isNaN(amount) || amount <= 0) { alert('Please enter a valid amount.'); return; }
    items = [];
  }

  const record = { item, amount, category, date, notes, items };
  if (editingId) {
    const idx = expenses.findIndex(x => x.id === editingId);
    if (idx !== -1) expenses[idx] = { ...expenses[idx], ...record };
  } else {
    expenses.unshift({ id: uid(), ...record, ts: Date.now() });
  }
  saveExpenses(); closeModal(); render();
});

// ══════════════════════════════════════════════════════════
// EXPENSE DETAIL MODAL
// ══════════════════════════════════════════════════════════
const detailOverlay = document.getElementById('detailOverlay');

function openDetail(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;

  // Header
  document.getElementById('detailCatIcon').textContent = CATEGORY_ICONS[e.category] || '💼';
  document.getElementById('detailCatIcon').className   = 'detail-cat-icon icon-' + e.category;
  document.getElementById('detailName').textContent    = e.item;
  const catBadge = document.getElementById('detailCategoryBadge');
  catBadge.textContent  = e.category;
  catBadge.className    = 'exp-category cat-' + e.category;
  document.getElementById('detailDate').textContent    = formatDateLabel(e.date);

  // Notes
  const notesEl = document.getElementById('detailNotes');
  if (e.notes) {
    notesEl.textContent    = '📝 ' + e.notes;
    notesEl.style.display  = 'block';
  } else {
    notesEl.style.display  = 'none';
  }

  const hasItems = e.items && e.items.length > 0;
  document.getElementById('detailItemsSection').style.display  = hasItems ? 'block' : 'none';
  document.getElementById('detailSimpleSection').style.display = hasItems ? 'none'  : 'block';

  if (hasItems) {
    // Build items table
    const sym  = displayCurrency === 'GBP' ? '£' : '₦';
    const conv = displayCurrency === 'GBP' ? 1 : gbpToNgn;

    document.getElementById('detailItemsBody').innerHTML = e.items.map(item => {
      const sub = item.qty * item.price;
      return `<tr>
        <td class="di-name">${escHtml(item.name || '—')}</td>
        <td class="di-qty">${item.qty}</td>
        <td class="di-price">${sym}${(item.price * conv).toLocaleString('en', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
        <td class="di-sub">${sym}${(sub * conv).toLocaleString('en', {minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      </tr>`;
    }).join('');

    document.getElementById('detailItemCount').textContent =
      e.items.length + ' item' + (e.items.length !== 1 ? 's' : '');
    document.getElementById('detailTotal').textContent    = fmtDisplay(e.amount);
    document.getElementById('detailTotalAlt').textContent = fmtAlt(e.amount);
  } else {
    document.getElementById('detailSimpleMain').textContent = fmtDisplay(e.amount);
    document.getElementById('detailSimpleAlt').textContent  = fmtAlt(e.amount);
  }

  // Wire up footer buttons
  document.getElementById('detailEditBtn').onclick   = () => { closeDetail(); openEdit(id); };
  document.getElementById('detailDeleteBtn').onclick = () => { closeDetail(); openDelete(id); };

  detailOverlay.classList.add('open');
}

function closeDetail() { detailOverlay.classList.remove('open'); }

document.getElementById('closeDetailBtn').addEventListener('click', closeDetail);
detailOverlay.addEventListener('click', e => { if (e.target === detailOverlay) closeDetail(); });

// ══════════════════════════════════════════════════════════
// DELETE MODAL
// ══════════════════════════════════════════════════════════
const deleteOverlay = document.getElementById('deleteOverlay');
function openDelete(id) {
  deleteTarget = id;
  const e = expenses.find(x => x.id === id);
  document.getElementById('deleteItemName').textContent = e ? e.item : 'this item';
  deleteOverlay.classList.add('open');
}
function closeDelete() { deleteOverlay.classList.remove('open'); deleteTarget = null; }
document.getElementById('closeDeleteBtn').addEventListener('click', closeDelete);
document.getElementById('cancelDeleteBtn').addEventListener('click', closeDelete);
deleteOverlay.addEventListener('click', e => { if (e.target === deleteOverlay) closeDelete(); });
document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  if (deleteTarget) { expenses = expenses.filter(e => e.id !== deleteTarget); saveExpenses(); }
  closeDelete(); render();
});

// ══════════════════════════════════════════════════════════
// RATE BAR CONTROLS
// ══════════════════════════════════════════════════════════
const customRateOverlay = document.getElementById('customRateOverlay');
document.getElementById('refreshRateBtn').addEventListener('click', () => { rateIsCustom=false; fetchLiveRate(); });
document.getElementById('customRateBtn').addEventListener('click', () => {
  document.getElementById('customRateInput').value = gbpToNgn.toFixed(2);
  customRateOverlay.classList.add('open');
  document.getElementById('customRateInput').focus();
});
document.getElementById('closeCustomRateBtn').addEventListener('click',  () => customRateOverlay.classList.remove('open'));
document.getElementById('cancelCustomRateBtn').addEventListener('click', () => customRateOverlay.classList.remove('open'));
customRateOverlay.addEventListener('click', e=>{ if(e.target===customRateOverlay) customRateOverlay.classList.remove('open'); });
document.getElementById('applyCustomRateBtn').addEventListener('click', () => {
  const val = parseFloat(document.getElementById('customRateInput').value);
  if (isNaN(val)||val<=0) { alert('Please enter a valid exchange rate.'); return; }
  gbpToNgn=val; rateIsCustom=true; updateRateBar(); render();
  customRateOverlay.classList.remove('open');
});
document.getElementById('restoreLiveRateBtn').addEventListener('click', () => {
  customRateOverlay.classList.remove('open'); rateIsCustom=false; fetchLiveRate();
});

// ══════════════════════════════════════════════════════════
// QUICK CONVERTER
// ══════════════════════════════════════════════════════════
const convGBP = document.getElementById('convGBP');
const convNGN = document.getElementById('convNGN');
convGBP.addEventListener('input', () => { const v=parseFloat(convGBP.value); convNGN.value=isNaN(v)?'':(v*gbpToNgn).toFixed(2); });
convNGN.addEventListener('input', () => { const v=parseFloat(convNGN.value); convGBP.value=isNaN(v)||gbpToNgn<=0?'':(v/gbpToNgn).toFixed(2); });
document.getElementById('convSwapBtn').addEventListener('click', () => {
  const g=convGBP.value, n=convNGN.value;
  convGBP.value = n?(parseFloat(n)/gbpToNgn).toFixed(2):'';
  convNGN.value = g?(parseFloat(g)*gbpToNgn).toFixed(2):'';
});
function updateConverterNote() {
  const el = document.getElementById('convRateNote');
  el.textContent = `1 £ = ₦${Number(gbpToNgn).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}  ·  1 ₦ = £${(1/gbpToNgn).toFixed(6)}`;
  const g = parseFloat(convGBP.value);
  if (!isNaN(g) && convGBP.value) convNGN.value = (g*gbpToNgn).toFixed(2);
}

// ══════════════════════════════════════════════════════════
// TIPS
// ══════════════════════════════════════════════════════════
function pickTips(n=3) {
  const pool=ALL_TIPS.filter(t=>!shownTips.includes(t)), src=pool.length>=n?pool:ALL_TIPS;
  const picked=[], used=new Set();
  while(picked.length<n){ const i=Math.floor(Math.random()*src.length); if(!used.has(i)){picked.push(src[i]);used.add(i);} }
  shownTips=picked; return picked;
}
function renderTips() {
  document.getElementById('tipsList').innerHTML = pickTips(3).map((t,i)=>`<div class="tip-item" data-num="${i+1}">${t}</div>`).join('');
}
document.getElementById('refreshTip').addEventListener('click', renderTips);

// ── Keyboard ───────────────────────────────────────────────
document.addEventListener('keydown', e=>{
  if (e.key==='Escape') { closeModal(); closeDelete(); closeDetail(); customRateOverlay.classList.remove('open'); }
  if (e.key==='n' && !modalOverlay.classList.contains('open') &&
      document.activeElement.tagName!=='INPUT' && document.activeElement.tagName!=='SELECT') {
    openModal();
  }
});

// Auto-refresh rate every 30 min
setInterval(()=>{ if(!rateIsCustom) fetchLiveRate(); }, 30*60*1000);

// ── Init ───────────────────────────────────────────────────
fetchLiveRate();
render();
renderTips();
updateRateBar();
