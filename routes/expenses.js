const express = require('express');
const PDFKit  = require('pdfkit');
const Expense = require('../models/Expense');
const protect = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── GET all expenses ───────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1, ts: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── POST create expense ────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { item, amount, category, date, notes, items } = req.body;
    const expense = await Expense.create({ user: req.user._id, item, amount, category, date, notes: notes||'', items: items||[] });
    res.status(201).json({ success: true, data: expense });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── PUT update expense ─────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    const { item, amount, category, date, notes, items } = req.body;
    Object.assign(expense, { item, amount, category, date, notes: notes||'', items: items||[] });
    await expense.save();
    res.json({ success: true, data: expense });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── DELETE expense ─────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── GET export CSV ─────────────────────────────────────────
router.get('/export/csv', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    const esc = (s) => `"${String(s||'').replace(/"/g,'""')}"`;

    const rows = [
      ['Date','Description','Category','Amount (GBP)','Notes','Items Detail'].join(','),
      ...expenses.map(e => [
        e.date,
        esc(e.item),
        e.category,
        e.amount.toFixed(2),
        esc(e.notes),
        esc(e.items.map(i=>`${i.name} x${i.qty} @£${i.price.toFixed(2)}`).join(' | ')),
      ].join(',')),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="spendsmart-expenses-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(rows.join('\n'));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── GET export PDF ─────────────────────────────────────────
router.get('/export/pdf', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    const user     = req.user;

    const doc = new PDFKit({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="spendsmart-report-${new Date().toISOString().slice(0,10)}.pdf"`);
    doc.pipe(res);

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 70).fill('#1a1d27');
    doc.fontSize(22).fillColor('#6c63ff').text('💳 SpendSmart', 40, 20);
    doc.fontSize(10).fillColor('#8b90b8').text('Expense Report', 40, 46);
    doc.fillColor('#e8eaf6').text(`${user.name}  ·  ${user.email}`, 40, 46, { align: 'right' });
    doc.fillColor('#8b90b8').fontSize(9).text(`Generated: ${new Date().toLocaleString('en-GB')}`, 40, 58, { align: 'right' });

    doc.moveDown(3);

    // ── Summary ──
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

    doc.fillColor('#e8eaf6').fontSize(13).font('Helvetica-Bold').text('Summary', 40, 90);
    doc.moveTo(40, 107).lineTo(555, 107).strokeColor('#2e3250').stroke();
    doc.fontSize(10).font('Helvetica');

    let y = 115;
    doc.fillColor('#8b90b8').text('Total Expenses:', 40, y);
    doc.fillColor('#ff6584').font('Helvetica-Bold').text(`£${total.toFixed(2)}`, 200, y);
    doc.fillColor('#8b90b8').font('Helvetica').text(`${expenses.length} transactions`, 350, y);
    y += 20;

    Object.entries(byCategory).forEach(([cat, amt]) => {
      doc.fillColor('#8b90b8').text(cat + ':', 40, y);
      doc.fillColor('#e8eaf6').text(`£${amt.toFixed(2)}`, 200, y);
      y += 16;
    });

    // ── Expenses Table ──
    y += 14;
    doc.fillColor('#e8eaf6').fontSize(13).font('Helvetica-Bold').text('All Expenses', 40, y);
    y += 18;
    doc.moveTo(40, y).lineTo(555, y).strokeColor('#2e3250').stroke();
    y += 8;

    // Table header
    doc.fillColor('#8b90b8').fontSize(9).font('Helvetica-Bold');
    doc.text('Date',        40, y);
    doc.text('Description', 105, y);
    doc.text('Category',    310, y);
    doc.text('Amount',      460, y, { width: 95, align: 'right' });
    y += 14;
    doc.moveTo(40, y).lineTo(555, y).strokeColor('#2e3250').stroke();
    y += 6;

    expenses.forEach((e, idx) => {
      if (y > 760) { doc.addPage(); y = 40; }
      const bg = idx % 2 === 0 ? '#1a1d27' : '#22263a';
      doc.rect(40, y - 3, 515, 18).fill(bg);

      doc.fillColor('#8b90b8').fontSize(8).font('Helvetica').text(e.date, 42, y);
      doc.fillColor('#e8eaf6').text(e.item.substring(0, 35), 105, y);
      doc.fillColor('#8b90b8').text(e.category, 310, y);
      doc.fillColor('#ff6584').font('Helvetica-Bold').text(`£${e.amount.toFixed(2)}`, 460, y, { width: 93, align: 'right' });

      // Items detail (if itemized)
      if (e.items && e.items.length > 0) {
        y += 14;
        const detail = e.items.map(i => `${i.name} ×${i.qty} @£${i.price.toFixed(2)}`).join('   ');
        doc.fillColor('#6c63ff').fontSize(7).font('Helvetica').text('  ↳ ' + detail, 115, y, { width: 430 });
        y += (detail.length > 80 ? 14 : 0);
      }
      y += 18;
    });

    // ── Footer ──
    doc.fontSize(8).fillColor('#8b90b8').text('SpendSmart — Your personal expense tracker', 40, 800, { align: 'center', width: 515 });

    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
