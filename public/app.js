/* ═══════════════════════════════════════════════════════════
   SpendSmart v2 — Full Stack Frontend  |  app.js
   ═══════════════════════════════════════════════════════════ */

const API_BASE = '/api';

// ── Auth guard ─────────────────────────────────────────────
const TOKEN = localStorage.getItem('ss_token');
if (!TOKEN) window.location.href = '/login.html';

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };
}

async function apiFetch(path, opts = {}) {
  const res  = await fetch(API_BASE + path, { ...opts, headers: { ...authHeaders(), ...(opts.headers||{}) } });
  if (res.status === 401) { localStorage.clear(); window.location.href = '/login.html'; }
  return res;
}

// ── App State ──────────────────────────────────────────────
let expenses        = [];
let budgets         = [];
let monthlyCap      = null;
let capBannerDismissed = false;
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

const CATEGORY_ICONS = { Food:'🍔', Transport:'🚗', Shopping:'🛍️', Entertainment:'🎬', Health:'💊', Bills:'⚡', Education:'📚', Others:'💼' };
const CHART_COLORS   = { Food:'#ff6b6b', Transport:'#ffa502', Shopping:'#a29bfe', Entertainment:'#fd79a8', Health:'#00cec9', Bills:'#fdcb6e', Education:'#74b9ff', Others:'#636e72' };
const ALL_TIPS = [
  'Follow the 50/30/20 rule: 50% on needs, 30% on wants, 20% on savings.',
  'Track every purchase — small daily expenses add up to thousands monthly.',
  'Build a 3–6 month emergency fund before investing.',
  'Meal-prep at home 4–5 days a week. Eating out is often 3–5× more expensive.',
  'Review your subscriptions every month. Cancel any unused in 30 days.',
  'Apply the 24-hour rule before buying non-essentials.',
  'Pay yourself first: automate savings on payday.',
  'Use a debit card — it keeps you more conscious of spending.',
  'Set a weekly spending cap per category and stop when you reach it.',
  'Buy non-perishables in bulk to save long-term.',
  'The best time to shop for clothes is during end-of-season sales.',
  'Review your mobile data plan — you may be overpaying.',
  'Cut transport costs by combining errands into one trip.',
  'Avoid grocery shopping when hungry.',
  'Invest the money you save from cutting expenses.',
  'Ask before every purchase: "Do I need this, or do I just want it?"',
  'Set specific goals: "Save £500 by June" beats "save more money".',
  'Use your expense data to find your top spending category and reduce it.',
  'Having both GBP and NGN visibility helps smarter cross-economy decisions.',
  'Use the itemized list feature to see where money goes within each purchase.',
  'Budget alerts keep you accountable — set one for every major category.',
  'Export your data monthly and review it — patterns reveal saving opportunities.',
  'Small wins compound: cutting £5/day saves £1,825 a year.',
];

// ── User setup ─────────────────────────────────────────────
function initUser() {
  try {
    const user = JSON.parse(localStorage.getItem('ss_user') || '{}');
    const name = user.name || 'User';
    const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    document.getElementById('userAvatar').textContent  = initials;
    document.getElementById('userName').textContent    = name.split(' ')[0];
    document.getElementById('dropdownName').textContent  = name;
    document.getElementById('dropdownEmail').textContent = user.email || '';
  } catch {}
}

// ── User menu ──────────────────────────────────────────────
document.getElementById('userMenuBtn').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('userDropdown').classList.toggle('open');
});
document.addEventListener('click', () => document.getElementById('userDropdown').classList.remove('open'));
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('ss_token');
  localStorage.removeItem('ss_user');
  window.location.href = '/login.html';
});

// ── Toast notifications ────────────────────────────────────
function showToast(msg, type = 'info', icon = null) {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon || icons[type]}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById('toastContainer').appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => { toast.classList.remove('visible'); setTimeout(() => toast.remove(), 350); }, 4500);
}

// ── Rate helpers ───────────────────────────────────────────
function loadCachedRate() {
  try { const c=JSON.parse(localStorage.getItem('ss_rate')); if(c?.rate&&c?.ts){rateUpdatedAt=new Date(c.ts);return c.rate;} } catch {}
  return 2050;
}
function saveCachedRate(r) { localStorage.setItem('ss_rate', JSON.stringify({rate:r,ts:Date.now()})); }

async function fetchLiveRate() {
  if (rateFetching) return; rateFetching=true;
  setRateStatus('fetching','Fetching live rate…');
  const eps = [
    async()=>{ const j=await(await fetch('https://open.er-api.com/v6/latest/GBP')).json(); if(j.result==='success'&&j.rates?.NGN)return j.rates.NGN; throw 0; },
    async()=>{ const j=await(await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/gbp.json')).json(); if(j.gbp?.ngn)return j.gbp.ngn; throw 0; },
  ];
  for(const fn of eps){try{gbpToNgn=await fn();rateIsCustom=false;rateUpdatedAt=new Date();saveCachedRate(gbpToNgn);updateRateBar();render();rateFetching=false;return;}catch{}}
  rateFetching=false; setRateStatus('error','Could not fetch — using cached'); updateRateBar(true);
}
function setRateStatus(t,m){ document.getElementById('rateDot').className='rate-dot '+t; document.getElementById('rateStatus').textContent=m; }
function updateRateBar(err=false){
  document.getElementById('rateValue').textContent=Number(gbpToNgn).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2});
  if(rateIsCustom){setRateStatus('custom','Custom rate applied');}
  else if(!err&&rateUpdatedAt){const m=Math.round((Date.now()-rateUpdatedAt.getTime())/60000);setRateStatus('live','Live · '+(m===0?'just now':m===1?'1 min ago':m+' mins ago'));}
  updateConverterNote();
  if(document.getElementById('itemizedSection').classList.contains('visible'))recalcItems();
}

// ── Currency ───────────────────────────────────────────────
function fmtGBP(n){ return '£'+Number(n).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fmtNGN(n){ return '₦'+Number(n).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fmtDisplay(g){ return displayCurrency==='NGN'?fmtNGN(g*gbpToNgn):fmtGBP(g); }
function fmtAlt(g)    { return displayCurrency==='NGN'?fmtGBP(g):fmtNGN(g*gbpToNgn); }

document.querySelectorAll('.cur-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    if(b.dataset.cur===displayCurrency)return;
    document.querySelectorAll('.cur-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); displayCurrency=b.dataset.cur; render();
  });
});
document.getElementById('refreshRateBtn').addEventListener('click',()=>{rateIsCustom=false;fetchLiveRate();});

// ── Rate bar custom modal ──────────────────────────────────
const customRateOverlay = document.getElementById('customRateOverlay');
document.getElementById('customRateBtn').addEventListener('click',()=>{ document.getElementById('customRateInput').value=gbpToNgn.toFixed(2); customRateOverlay.classList.add('open'); document.getElementById('customRateInput').focus(); });
document.getElementById('closeCustomRateBtn').addEventListener('click',()=>customRateOverlay.classList.remove('open'));
document.getElementById('cancelCustomRateBtn').addEventListener('click',()=>customRateOverlay.classList.remove('open'));
customRateOverlay.addEventListener('click',e=>{if(e.target===customRateOverlay)customRateOverlay.classList.remove('open');});
document.getElementById('applyCustomRateBtn').addEventListener('click',()=>{
  const v=parseFloat(document.getElementById('customRateInput').value);
  if(isNaN(v)||v<=0){showToast('Enter a valid rate.','error');return;}
  gbpToNgn=v;rateIsCustom=true;updateRateBar();render();customRateOverlay.classList.remove('open');
  showToast(`Custom rate set: 1 GBP = ₦${v.toLocaleString()}`, 'info', '💱');
});
document.getElementById('restoreLiveRateBtn').addEventListener('click',()=>{customRateOverlay.classList.remove('open');rateIsCustom=false;fetchLiveRate();});

// ── Utilities ──────────────────────────────────────────────
function today(){ return new Date().toISOString().slice(0,10); }
function startOfWeek(){ const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d.toISOString().slice(0,10); }
function startOfMonth(){ const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10); }
function currentMonthStr(){ return new Date().toISOString().slice(0,7); }
function filterByPeriod(list,p){ const t=today(),w=startOfWeek(),m=startOfMonth(); if(p==='day')return list.filter(e=>e.date===t); if(p==='week')return list.filter(e=>e.date>=w); if(p==='month')return list.filter(e=>e.date>=m); return list; }
function formatDateLabel(s){ const d=new Date(s+'T00:00:00'),t=today(),yd=new Date();yd.setDate(yd.getDate()-1); if(s===t)return'Today'; if(s===yd.toISOString().slice(0,10))return'Yesterday'; return d.toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'short',day:'numeric'}); }
function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Load data from API ─────────────────────────────────────
async function loadExpenses(){
  try{
    const r=await apiFetch('/expenses'); const j=await r.json();
    if(j.success) expenses=j.data.map(e=>({...e,id:e._id}));
  }catch(e){showToast('Failed to load expenses','error');}
}
async function loadBudgets(){
  try{
    const r=await apiFetch('/budgets'); const j=await r.json();
    if(j.success) budgets=j.data;
  }catch{}
}
async function loadMonthlyCap(){
  try{
    const r=await apiFetch('/budgets/cap'); const j=await r.json();
    if(j.success) monthlyCap=j.data;
  }catch{}
}

// ── Tabs ───────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active'); activePeriod=t.dataset.period; render();
  });
});

// ── Summary cards ──────────────────────────────────────────
function updateSummary(list){
  const total=list.reduce((s,e)=>s+e.amount,0);
  const days=Math.max([...new Set(list.map(e=>e.date))].length,1);
  let big={amount:0,item:'—'}; list.forEach(e=>{if(e.amount>big.amount)big=e;});
  document.getElementById('totalSpent').textContent   =fmtDisplay(total);
  document.getElementById('totalSpentAlt').textContent=fmtAlt(total);
  document.getElementById('txCount').textContent      =list.length+' transaction'+(list.length!==1?'s':'');
  document.getElementById('dailyAvg').textContent     =fmtDisplay(total/days);
  document.getElementById('dailyAvgAlt').textContent  =fmtAlt(total/days);
  document.getElementById('biggestExp').textContent   =fmtDisplay(big.amount);
  document.getElementById('biggestExpAlt').textContent=fmtAlt(big.amount);
  document.getElementById('biggestName').textContent  =big.item||'—';
}

// ── Chart ──────────────────────────────────────────────────
function updateChart(list){
  const canvas=document.getElementById('categoryChart'),empty=document.getElementById('chartEmpty');
  const totals={}; list.forEach(e=>{totals[e.category]=(totals[e.category]||0)+e.amount;});
  const labels=Object.keys(totals), data=Object.values(totals).map(v=>displayCurrency==='NGN'?v*gbpToNgn:v);
  if(!labels.length){canvas.style.display='none';empty.style.display='block';if(chart){chart.destroy();chart=null;}return;}
  canvas.style.display='block';empty.style.display='none';
  const sym=displayCurrency==='GBP'?'£':'₦',tot=data.reduce((a,b)=>a+b,0);
  if(chart)chart.destroy();
  chart=new Chart(canvas,{type:'doughnut',data:{labels,datasets:[{data,backgroundColor:labels.map(l=>CHART_COLORS[l]||'#636e72'),borderWidth:2,borderColor:'#1a1d27',hoverOffset:6}]},options:{cutout:'62%',plugins:{legend:{position:'bottom',labels:{color:'#8b90b8',font:{size:11},padding:10,boxWidth:12,boxHeight:12}},tooltip:{callbacks:{label:c=>' '+sym+Number(c.raw).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})+' ('+Math.round(c.raw/tot*100)+'%)'}}}}});
}

// ── Budget panel ───────────────────────────────────────────
function updateBudgetPanel(){
  const container=document.getElementById('budgetList');
  const month=new Date().toLocaleString('en-GB',{month:'long',year:'numeric'});
  document.getElementById('budgetMonthLabel').textContent=month;

  // Spending this month per category
  const monthStart=startOfMonth();
  const monthlySpend={};
  expenses.filter(e=>e.date>=monthStart).forEach(e=>{monthlySpend[e.category]=(monthlySpend[e.category]||0)+e.amount;});

  if(!budgets.length){container.innerHTML='<p class="budget-empty">No budgets set. Click <strong>🎯 Budgets</strong> to add goals.</p>';return;}

  container.innerHTML=budgets.map(b=>{
    const spent=monthlySpend[b.category]||0;
    const pct=Math.min((spent/b.monthlyLimit)*100,100);
    const over=spent>b.monthlyLimit, warn=pct>=70&&!over;
    const fillClass=over?'progress-over':warn?'progress-warn':'progress-ok';
    const statusClass=over?'status-over':warn?'status-warn':'status-ok';
    const statusMsg=over?`⚠ Over by ${fmtGBP(spent-b.monthlyLimit)}`:warn?`${Math.round(pct)}% used`:`${fmtGBP(b.monthlyLimit-spent)} remaining`;
    return`<div class="budget-item">
      <div class="budget-item-header">
        <span class="budget-item-name">${CATEGORY_ICONS[b.category]||'💼'} ${b.category}</span>
        <span class="budget-item-amounts"><span>${fmtGBP(spent)}</span> / ${fmtGBP(b.monthlyLimit)}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
      <div class="budget-status ${statusClass}">${statusMsg}</div>
    </div>`;
  }).join('');
}

// ── Check budgets after save (alert user) ─────────────────
function checkBudgetAlerts(savedCategory){
  const b=budgets.find(x=>x.category===savedCategory);
  if(!b)return;
  const monthStart=startOfMonth();
  const spent=expenses.filter(e=>e.date>=monthStart&&e.category===savedCategory).reduce((s,e)=>s+e.amount,0);
  const pct=(spent/b.monthlyLimit)*100;
  if(spent>b.monthlyLimit){showToast(`⚠ You've exceeded your ${savedCategory} budget! (${fmtGBP(spent)} / ${fmtGBP(b.monthlyLimit)})`,'warning','🚨');}
  else if(pct>=80){showToast(`You've used ${Math.round(pct)}% of your ${savedCategory} budget this month.`,'warning','⚠️');}
}

// ── Monthly cap warning banner ─────────────────────────────
function updateCapWarning(){
  const banner=document.getElementById('capBanner');
  if(!monthlyCap||!monthlyCap.limit){banner.style.display='none';return;}
  if(capBannerDismissed){return;}
  const monthStart=startOfMonth();
  const spent=expenses.filter(e=>e.date>=monthStart).reduce((s,e)=>s+e.amount,0);
  const pct=(spent/monthlyCap.limit)*100;
  if(pct<80){banner.style.display='none';return;}
  const over=pct>=100;
  banner.className='cap-banner '+(over?'over':'warn');
  banner.style.display='flex';
  document.getElementById('capBannerIcon').textContent=over?'🚨':'⚠️';
  document.getElementById('capBannerTitle').textContent=over?'Monthly cap exceeded!':'Approaching monthly cap';
  document.getElementById('capBannerMsg').textContent=over
    ?`You've spent ${fmtGBP(spent)} — ${fmtGBP(spent-monthlyCap.limit)} over your ${fmtGBP(monthlyCap.limit)} cap.`
    :`You've used ${fmtGBP(spent)} of your ${fmtGBP(monthlyCap.limit)} monthly cap.`;
  document.getElementById('capBannerBar').style.width=Math.min(pct,100)+'%';
  document.getElementById('capBannerPct').textContent=Math.round(pct)+'%';
}

// ── Cap progress in sidebar budget panel ───────────────────
function updateCapSidebarSection(){
  const el=document.getElementById('capSidebarSection');
  if(!el)return;
  if(!monthlyCap||!monthlyCap.limit){el.innerHTML='';return;}
  const monthStart=startOfMonth();
  const spent=expenses.filter(e=>e.date>=monthStart).reduce((s,e)=>s+e.amount,0);
  const raw=(spent/monthlyCap.limit)*100;
  const pct=Math.min(raw,100);
  const over=raw>=100, warn=raw>=80&&!over;
  const fillClass=over?'cap-progress-over':warn?'cap-progress-warn':'cap-progress-ok';
  const statusClass=over?'status-over':warn?'status-warn':'status-ok';
  const statusMsg=over
    ?`⚠ Over by ${fmtGBP(spent-monthlyCap.limit)}`
    :warn
      ?`${Math.round(raw)}% of cap used`
      :`${fmtGBP(monthlyCap.limit-spent)} remaining`;
  el.innerHTML=`<div class="cap-sidebar-section">
    <div class="cap-sidebar-header">
      <span class="cap-sidebar-label">💰 Monthly Cap</span>
      <span class="cap-sidebar-amounts"><span>${fmtGBP(spent)}</span> / ${fmtGBP(monthlyCap.limit)}</span>
    </div>
    <div class="cap-progress-bar"><div class="cap-progress-fill ${fillClass}" style="width:${pct}%"></div></div>
    <div class="budget-status ${statusClass}">${statusMsg}</div>
  </div>`;
}

// ── Cap UI in budget management modal ─────────────────────
function updateCapModalUI(){
  const inp=document.getElementById('capLimitInput');
  const status=document.getElementById('capModalStatus');
  const removeBtn=document.getElementById('removeCapBtn');
  if(monthlyCap&&monthlyCap.limit){
    inp.value=monthlyCap.limit.toFixed(2);
    removeBtn.style.display='inline-block';
    const monthStart=startOfMonth();
    const spent=expenses.filter(e=>e.date>=monthStart).reduce((s,e)=>s+e.amount,0);
    const pct=Math.round((spent/monthlyCap.limit)*100);
    status.textContent=`This month: ${fmtGBP(spent)} spent (${pct}% of cap)`;
  }else{
    inp.value='';
    removeBtn.style.display='none';
    status.textContent='No cap set yet.';
  }
}

// ── Expense list render ────────────────────────────────────
function applyFiltersAndSort(list){
  const search=document.getElementById('searchInput').value.toLowerCase();
  const catF=document.getElementById('categoryFilter').value;
  const sort=document.getElementById('sortSelect').value;
  return list.filter(e=>(e.item.toLowerCase().includes(search)||(e.notes||'').toLowerCase().includes(search))&&(catF==='all'||e.category===catF))
    .sort((a,b)=>sort==='date-desc'?b.date.localeCompare(a.date)||b.ts-a.ts:sort==='date-asc'?a.date.localeCompare(b.date)||a.ts-b.ts:sort==='amount-desc'?b.amount-a.amount:a.amount-b.amount);
}
function renderList(list){
  const container=document.getElementById('expenseList'),empty=document.getElementById('emptyState');
  if(!list.length){container.innerHTML='';container.appendChild(empty);empty.style.display='flex';return;}
  empty.style.display='none';
  const groups={};list.forEach(e=>{(groups[e.date]=groups[e.date]||[]).push(e);});
  const sortedDates=Object.keys(groups).sort((a,b)=>document.getElementById('sortSelect').value==='date-asc'?a.localeCompare(b):b.localeCompare(a));
  container.innerHTML='';
  sortedDates.forEach(date=>{
    const dayGBP=groups[date].reduce((s,e)=>s+e.amount,0);
    const hdr=document.createElement('div'); hdr.className='date-group-header';
    hdr.textContent=formatDateLabel(date)+'  —  '+fmtDisplay(dayGBP)+'  ('+fmtAlt(dayGBP)+')';
    container.appendChild(hdr);
    groups[date].forEach(e=>{
      const hasItems=e.items&&e.items.length>0;
      const row=document.createElement('div'); row.className='expense-item';
      row.innerHTML=`<div class="exp-icon icon-${e.category}">${CATEGORY_ICONS[e.category]||'💼'}</div>
        <div class="exp-details">
          <div class="exp-name">${escHtml(e.item)}</div>
          <div class="exp-meta">
            <span class="exp-category cat-${e.category}">${e.category}</span>
            ${hasItems?`<span class="items-badge">📋 ${e.items.length} item${e.items.length!==1?'s':''}</span>`:''}
            ${e.notes?'<span>'+escHtml(e.notes)+'</span>':''}
          </div>
        </div>
        <div class="exp-amount-col"><div class="exp-amount">${fmtDisplay(e.amount)}</div><div class="exp-amount-alt">${fmtAlt(e.amount)}</div></div>
        <div class="exp-actions">
          <button class="btn-edit"   data-id="${e.id}" title="Edit">✏️</button>
          <button class="btn-delete" data-id="${e.id}" title="Delete">🗑️</button>
        </div>`;
      row.addEventListener('click',ev=>{if(!ev.target.closest('.exp-actions'))openDetail(e.id);});
      row.querySelector('.btn-edit').addEventListener('click',ev=>{ev.stopPropagation();openEdit(e.id);});
      row.querySelector('.btn-delete').addEventListener('click',ev=>{ev.stopPropagation();openDelete(e.id);});
      container.appendChild(row);
    });
  });
}

// ── Main render ────────────────────────────────────────────
function render(){
  const periodList=filterByPeriod(expenses,activePeriod);
  updateSummary(periodList);
  updateChart(periodList);
  renderList(applyFiltersAndSort(periodList));
  updateBudgetPanel();
  updateConverterNote();
  updateCapWarning();
  updateCapSidebarSection();
}
['searchInput','categoryFilter','sortSelect'].forEach(id=>document.getElementById(id).addEventListener('input',render));

// ══════════════════════════════════════════════════════════
// ITEMIZED ROW LOGIC
// ══════════════════════════════════════════════════════════
function createItemRow(name='',qty=1,price=''){
  const row=document.createElement('div'); row.className='item-row';
  const ni=document.createElement('input'); ni.type='text';ni.className='item-name';ni.placeholder='e.g. Milk 2L';ni.value=name;
  const qi=document.createElement('input'); qi.type='number';qi.className='item-qty';qi.value=qty;qi.min='0.01';qi.step='0.01';
  const pw=document.createElement('div');pw.className='item-price-wrap';
  const ps=document.createElement('span');ps.className='ip-sym';ps.textContent='£';
  const pi=document.createElement('input');pi.type='number';pi.className='item-price';pi.placeholder='0.00';pi.min='0';pi.step='0.01';
  if(price!=='')pi.value=price;
  pw.appendChild(ps);pw.appendChild(pi);
  const sub=document.createElement('span');sub.className='item-sub';sub.textContent='£0.00';
  const rm=document.createElement('button');rm.type='button';rm.className='item-rm-btn';rm.title='Remove';rm.textContent='×';
  row.appendChild(ni);row.appendChild(qi);row.appendChild(pw);row.appendChild(sub);row.appendChild(rm);
  qi.addEventListener('input',()=>{updateRowSubtotal(row);recalcItems();});
  pi.addEventListener('input',()=>{updateRowSubtotal(row);recalcItems();});
  rm.addEventListener('click',()=>{row.remove();recalcItems();if(!document.getElementById('itemRowsContainer').children.length)addBlankItemRow();});
  updateRowSubtotal(row);
  return row;
}
function updateRowSubtotal(row){const q=parseFloat(row.querySelector('.item-qty').value)||0,p=parseFloat(row.querySelector('.item-price').value)||0;row.querySelector('.item-sub').textContent=fmtGBP(q*p);}
function recalcItems(){let t=0;document.querySelectorAll('#itemRowsContainer .item-row').forEach(r=>{const q=parseFloat(r.querySelector('.item-qty').value)||0,p=parseFloat(r.querySelector('.item-price').value)||0,s=q*p;t+=s;r.querySelector('.item-sub').textContent=fmtGBP(s);});document.getElementById('itemsGrandTotal').textContent=fmtGBP(t);document.getElementById('itemsGrandTotalNgn').textContent='≈ '+fmtNGN(t*gbpToNgn);}
function addBlankItemRow(){document.getElementById('itemRowsContainer').appendChild(createItemRow());}
function collectItems(){const items=[];document.querySelectorAll('#itemRowsContainer .item-row').forEach(r=>{const n=r.querySelector('.item-name').value.trim(),q=parseFloat(r.querySelector('.item-qty').value)||1,p=parseFloat(r.querySelector('.item-price').value)||0;if(p>0)items.push({name:n||'Item',qty:q,price:p});});return items;}
function clearItemRows(){document.getElementById('itemRowsContainer').innerHTML='';document.getElementById('itemsGrandTotal').textContent='£0.00';document.getElementById('itemsGrandTotalNgn').textContent='≈ ₦0.00';}

const itemizedToggle=document.getElementById('itemizedToggle');
const itemizedSection=document.getElementById('itemizedSection');
const simpleAmountSection=document.getElementById('simpleAmountSection');
itemizedToggle.addEventListener('change',()=>{
  if(itemizedToggle.checked){simpleAmountSection.style.display='none';itemizedSection.classList.add('visible');if(!document.getElementById('itemRowsContainer').children.length){addBlankItemRow();addBlankItemRow();addBlankItemRow();}}
  else{simpleAmountSection.style.display='block';itemizedSection.classList.remove('visible');const t=collectItems().reduce((s,i)=>s+i.qty*i.price,0);if(t>0){document.getElementById('amount').value=t.toFixed(2);updateAmountConverted(t);}}
});
document.getElementById('addItemRowBtn').addEventListener('click',addBlankItemRow);

// ══════════════════════════════════════════════════════════
// ADD / EDIT MODAL
// ══════════════════════════════════════════════════════════
const modalOverlay=document.getElementById('modalOverlay');
const expenseForm=document.getElementById('expenseForm');

function openModal(id=null){
  editingId=id;
  document.getElementById('editId').value=id||'';
  document.getElementById('modalTitle').textContent=id?'Edit Expense':'Add Expense';
  document.getElementById('saveBtn').textContent=id?'Save Changes':'Save Expense';
  if(id){
    const e=expenses.find(x=>x.id===id);
    document.getElementById('itemName').value=e.item;
    document.getElementById('category').value=e.category;
    document.getElementById('expDate').value=e.date;
    document.getElementById('notes').value=e.notes||'';
    if(e.items&&e.items.length){itemizedToggle.checked=true;simpleAmountSection.style.display='none';itemizedSection.classList.add('visible');clearItemRows();const c=document.getElementById('itemRowsContainer');e.items.forEach(i=>c.appendChild(createItemRow(i.name,i.qty,i.price)));recalcItems();}
    else{itemizedToggle.checked=false;simpleAmountSection.style.display='block';itemizedSection.classList.remove('visible');document.getElementById('amount').value=e.amount;updateAmountConverted(e.amount);}
  }else{
    expenseForm.reset();document.getElementById('expDate').value=today();
    itemizedToggle.checked=false;simpleAmountSection.style.display='block';itemizedSection.classList.remove('visible');clearItemRows();document.getElementById('amountConverted').textContent='';
  }
  modalOverlay.classList.add('open');
  setTimeout(()=>document.getElementById('itemName').focus(),50);
}
function closeModal(){modalOverlay.classList.remove('open');editingId=null;}
document.getElementById('openModalBtn').addEventListener('click',()=>openModal());
document.getElementById('closeModalBtn').addEventListener('click',closeModal);
document.getElementById('cancelBtn').addEventListener('click',closeModal);
modalOverlay.addEventListener('click',e=>{if(e.target===modalOverlay)closeModal();});
function openEdit(id){openModal(id);}

document.getElementById('amount').addEventListener('input',()=>{const v=parseFloat(document.getElementById('amount').value);updateAmountConverted(isNaN(v)?0:v);});
function updateAmountConverted(v){const el=document.getElementById('amountConverted');if(!v||v<=0){el.textContent='';return;}el.textContent='≈ '+fmtNGN(v*gbpToNgn)+' at current rate';}

expenseForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const item=document.getElementById('itemName').value.trim();
  const category=document.getElementById('category').value;
  const date=document.getElementById('expDate').value;
  const notes=document.getElementById('notes').value.trim();
  if(!item||!category||!date){showToast('Please fill all required fields.','error');return;}
  let amount,items;
  if(itemizedToggle.checked){
    // Highlight rows missing a price
    let missingPrice=false;
    document.querySelectorAll('#itemRowsContainer .item-row').forEach(r=>{
      const n=r.querySelector('.item-name').value.trim();
      const p=parseFloat(r.querySelector('.item-price').value)||0;
      const pw=r.querySelector('.item-price-wrap');
      if(n&&p<=0){pw.style.border='1.5px solid #ff6b6b';missingPrice=true;}
      else{pw.style.border='';}
    });
    if(missingPrice){showToast('Please enter a price for each item.','error');return;}
    items=collectItems();amount=items.reduce((s,i)=>s+i.qty*i.price,0);
    if(!items.length||amount<=0){showToast('Add at least one item with a price.','error');return;}
  }
  else{amount=parseFloat(document.getElementById('amount').value);if(isNaN(amount)||amount<=0){showToast('Enter a valid amount.','error');return;}items=[];}
  const body=JSON.stringify({item,amount,category,date,notes,items});
  try{
    document.getElementById('saveBtn').textContent='Saving…';document.getElementById('saveBtn').disabled=true;
    const r=await apiFetch(editingId?`/expenses/${editingId}`:'/expenses',{method:editingId?'PUT':'POST',body});
    const j=await r.json();
    if(!j.success){showToast(j.message||'Failed to save','error');document.getElementById('saveBtn').textContent=editingId?'Save Changes':'Save Expense';document.getElementById('saveBtn').disabled=false;return;}
    await loadExpenses();
    closeModal();render();
    checkBudgetAlerts(category);
    capBannerDismissed=false; updateCapWarning();
    showToast(editingId?'Expense updated!':'Expense saved!','success');
  }catch{showToast('Network error.','error');}
  finally{document.getElementById('saveBtn').textContent=editingId?'Save Changes':'Save Expense';document.getElementById('saveBtn').disabled=false;}
});

// ══════════════════════════════════════════════════════════
// DETAIL MODAL
// ══════════════════════════════════════════════════════════
const detailOverlay=document.getElementById('detailOverlay');
function openDetail(id){
  const e=expenses.find(x=>x.id===id); if(!e)return;
  document.getElementById('detailCatIcon').textContent=CATEGORY_ICONS[e.category]||'💼';
  document.getElementById('detailCatIcon').className='detail-cat-icon icon-'+e.category;
  document.getElementById('detailName').textContent=e.item;
  const cb=document.getElementById('detailCategoryBadge');cb.textContent=e.category;cb.className='exp-category cat-'+e.category;
  document.getElementById('detailDate').textContent=formatDateLabel(e.date);
  const ne=document.getElementById('detailNotes');if(e.notes){ne.textContent='📝 '+e.notes;ne.style.display='block';}else{ne.style.display='none';}
  const hasItems=e.items&&e.items.length>0;
  document.getElementById('detailItemsSection').style.display=hasItems?'block':'none';
  document.getElementById('detailSimpleSection').style.display=hasItems?'none':'block';
  if(hasItems){
    const sym=displayCurrency==='GBP'?'£':'₦',conv=displayCurrency==='GBP'?1:gbpToNgn;
    document.getElementById('detailItemsBody').innerHTML=e.items.map(i=>`<tr><td class="di-name">${escHtml(i.name||'—')}</td><td class="di-qty">${i.qty}</td><td class="di-price">${sym}${(i.price*conv).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td class="di-sub">${sym}${(i.qty*i.price*conv).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>`).join('');
    document.getElementById('detailItemCount').textContent=e.items.length+' item'+(e.items.length!==1?'s':'');
    document.getElementById('detailTotal').textContent=fmtDisplay(e.amount);
    document.getElementById('detailTotalAlt').textContent=fmtAlt(e.amount);
  }else{
    document.getElementById('detailSimpleMain').textContent=fmtDisplay(e.amount);
    document.getElementById('detailSimpleAlt').textContent=fmtAlt(e.amount);
  }
  document.getElementById('detailEditBtn').onclick=()=>{closeDetail();openEdit(id);};
  document.getElementById('detailDeleteBtn').onclick=()=>{closeDetail();openDelete(id);};
  detailOverlay.classList.add('open');
}
function closeDetail(){detailOverlay.classList.remove('open');}
document.getElementById('closeDetailBtn').addEventListener('click',closeDetail);
detailOverlay.addEventListener('click',e=>{if(e.target===detailOverlay)closeDetail();});

// ══════════════════════════════════════════════════════════
// DELETE MODAL
// ══════════════════════════════════════════════════════════
const deleteOverlay=document.getElementById('deleteOverlay');
function openDelete(id){deleteTarget=id;const e=expenses.find(x=>x.id===id);document.getElementById('deleteItemName').textContent=e?e.item:'this item';deleteOverlay.classList.add('open');}
function closeDelete(){deleteOverlay.classList.remove('open');deleteTarget=null;}
document.getElementById('closeDeleteBtn').addEventListener('click',closeDelete);
document.getElementById('cancelDeleteBtn').addEventListener('click',closeDelete);
deleteOverlay.addEventListener('click',e=>{if(e.target===deleteOverlay)closeDelete();});
document.getElementById('confirmDeleteBtn').addEventListener('click',async()=>{
  if(!deleteTarget)return;
  try{
    const r=await apiFetch(`/expenses/${deleteTarget}`,{method:'DELETE'});
    const j=await r.json();
    if(!j.success){showToast(j.message||'Delete failed','error');return;}
    await loadExpenses();closeDelete();render();
    showToast('Expense deleted.','success','🗑️');
  }catch{showToast('Network error.','error');}
});

// ══════════════════════════════════════════════════════════
// BUDGET MANAGEMENT MODAL
// ══════════════════════════════════════════════════════════
const budgetOverlay=document.getElementById('budgetOverlay');

function renderBudgetModalList(){
  const container=document.getElementById('budgetModalList');
  if(!budgets.length){container.innerHTML='<p class="budget-modal-empty">No budgets yet. Set one above!</p>';return;}
  container.innerHTML=budgets.map(b=>`
    <div class="budget-modal-item">
      <span class="bmi-icon">${CATEGORY_ICONS[b.category]||'💼'}</span>
      <div class="bmi-info">
        <div class="bmi-cat">${b.category}</div>
        <div class="bmi-limit">Monthly limit: <span>${fmtGBP(b.monthlyLimit)}</span></div>
      </div>
      <button class="bmi-del" data-cat="${b.category}" title="Remove budget">🗑️</button>
    </div>`).join('');
  container.querySelectorAll('.bmi-del').forEach(btn=>{
    btn.addEventListener('click',async()=>{
      try{
        await apiFetch(`/budgets/${btn.dataset.cat}`,{method:'DELETE'});
        await loadBudgets();renderBudgetModalList();updateBudgetPanel();
        showToast(`${btn.dataset.cat} budget removed.`,'info');
      }catch{showToast('Failed to remove budget.','error');}
    });
  });
}

document.getElementById('openBudgetBtn').addEventListener('click',()=>{renderBudgetModalList();updateCapModalUI();budgetOverlay.classList.add('open');});
document.getElementById('closeBudgetBtn').addEventListener('click',()=>budgetOverlay.classList.remove('open'));
budgetOverlay.addEventListener('click',e=>{if(e.target===budgetOverlay)budgetOverlay.classList.remove('open');});

document.getElementById('addBudgetBtn').addEventListener('click',async()=>{
  const cat=document.getElementById('budgetCategorySelect').value;
  const lim=parseFloat(document.getElementById('budgetLimitInput').value);
  if(!cat){showToast('Please select a category.','error');return;}
  if(isNaN(lim)||lim<=0){showToast('Enter a valid amount.','error');return;}
  try{
    const r=await apiFetch('/budgets',{method:'POST',body:JSON.stringify({category:cat,monthlyLimit:lim})});
    const j=await r.json();
    if(!j.success){showToast(j.message||'Failed','error');return;}
    await loadBudgets();renderBudgetModalList();updateBudgetPanel();
    document.getElementById('budgetCategorySelect').value='';
    document.getElementById('budgetLimitInput').value='';
    showToast(`${cat} budget set to ${fmtGBP(lim)}/month`,'success','🎯');
  }catch{showToast('Network error.','error');}
});

// ── Monthly cap buttons ─────────────────────────────────────
document.getElementById('saveCapBtn').addEventListener('click',async()=>{
  const lim=parseFloat(document.getElementById('capLimitInput').value);
  if(isNaN(lim)||lim<=0){showToast('Enter a valid cap amount.','error');return;}
  try{
    const r=await apiFetch('/budgets/cap',{method:'POST',body:JSON.stringify({limit:lim})});
    const j=await r.json();
    if(!j.success){showToast(j.message||'Failed','error');return;}
    monthlyCap=j.data;
    capBannerDismissed=false;
    updateCapModalUI();updateCapWarning();updateCapSidebarSection();
    showToast(`Monthly cap set to ${fmtGBP(lim)}/month`,'success','💰');
  }catch{showToast('Network error.','error');}
});

document.getElementById('removeCapBtn').addEventListener('click',async()=>{
  try{
    await apiFetch('/budgets/cap',{method:'DELETE'});
    monthlyCap=null;
    updateCapModalUI();updateCapWarning();updateCapSidebarSection();
    showToast('Monthly cap removed.','info','💰');
  }catch{showToast('Network error.','error');}
});

document.getElementById('capBannerClose').addEventListener('click',()=>{
  capBannerDismissed=true;
  document.getElementById('capBanner').style.display='none';
});

// ══════════════════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════════════════
document.getElementById('exportCsvBtn').addEventListener('click',async()=>{
  try{
    showToast('Preparing CSV…','info','📥');
    const r=await apiFetch('/expenses/export/csv');
    if(!r.ok){showToast('Export failed.','error');return;}
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`spendsmart-${today()}.csv`;a.click();
    URL.revokeObjectURL(url);
    showToast('CSV downloaded!','success','📥');
  }catch{showToast('Export failed.','error');}
});

document.getElementById('exportPdfBtn').addEventListener('click',async()=>{
  try{
    showToast('Generating PDF…','info','📄');
    const r=await apiFetch('/expenses/export/pdf');
    if(!r.ok){showToast('PDF export failed.','error');return;}
    const blob=await r.blob();
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`spendsmart-report-${today()}.pdf`;a.click();
    URL.revokeObjectURL(url);
    showToast('PDF downloaded!','success','📄');
  }catch{showToast('PDF export failed.','error');}
});

// ══════════════════════════════════════════════════════════
// QUICK CONVERTER
// ══════════════════════════════════════════════════════════
const cGBP=document.getElementById('convGBP'),cNGN=document.getElementById('convNGN');
cGBP.addEventListener('input',()=>{const v=parseFloat(cGBP.value);cNGN.value=isNaN(v)?'':(v*gbpToNgn).toFixed(2);});
cNGN.addEventListener('input',()=>{const v=parseFloat(cNGN.value);cGBP.value=isNaN(v)||gbpToNgn<=0?'':(v/gbpToNgn).toFixed(2);});
document.getElementById('convSwapBtn').addEventListener('click',()=>{const g=cGBP.value,n=cNGN.value;cGBP.value=n?(parseFloat(n)/gbpToNgn).toFixed(2):'';cNGN.value=g?(parseFloat(g)*gbpToNgn).toFixed(2):'';});
function updateConverterNote(){const el=document.getElementById('convRateNote');el.textContent=`1 £ = ₦${Number(gbpToNgn).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}  ·  1 ₦ = £${(1/gbpToNgn).toFixed(6)}`;const g=parseFloat(cGBP.value);if(!isNaN(g)&&cGBP.value)cNGN.value=(g*gbpToNgn).toFixed(2);}

// ══════════════════════════════════════════════════════════
// TIPS
// ══════════════════════════════════════════════════════════
function pickTips(n=3){const pool=ALL_TIPS.filter(t=>!shownTips.includes(t)),src=pool.length>=n?pool:ALL_TIPS;const picked=[],used=new Set();while(picked.length<n){const i=Math.floor(Math.random()*src.length);if(!used.has(i)){picked.push(src[i]);used.add(i);}}shownTips=picked;return picked;}
function renderTips(){document.getElementById('tipsList').innerHTML=pickTips(3).map((t,i)=>`<div class="tip-item" data-num="${i+1}">${t}</div>`).join('');}
document.getElementById('refreshTip').addEventListener('click',renderTips);

// ── Budget month label ─────────────────────────────────────
document.getElementById('budgetMonthLabel').textContent=new Date().toLocaleString('en-GB',{month:'long',year:'numeric'});

// ── Keyboard shortcuts ─────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();closeDelete();closeDetail();customRateOverlay.classList.remove('open');budgetOverlay.classList.remove('open');}
  if(e.key==='n'&&!modalOverlay.classList.contains('open')&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='SELECT')openModal();
});

// Auto-refresh rate every 30 min
setInterval(()=>{if(!rateIsCustom)fetchLiveRate();},30*60*1000);

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════
(async()=>{
  initUser();
  fetchLiveRate();
  updateRateBar();
  await Promise.all([loadExpenses(),loadBudgets(),loadMonthlyCap()]);
  render();
  renderTips();
})();
