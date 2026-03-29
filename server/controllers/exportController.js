const asyncHandler = require('../utils/asyncHandler');
const Transaction  = require('../models/Transaction');
const PDFDocument  = require('pdfkit');

function buildExportFilter(userId, query) {
  const { type, category, startDate, endDate, search } = query;
  const filter = { user: userId };
  if (type)     filter.type     = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate)   filter.date.$lte = new Date(endDate);
  }
  if (search) filter.description = { $regex: search.trim(), $options: 'i' };
  return filter;
}

// GET /api/transactions/export/csv
const exportCSV = asyncHandler(async (req, res) => {
  const filter       = buildExportFilter(req.user._id, req.query);
  const transactions = await Transaction.find(filter).sort('-date').lean();

  const esc  = (s) => `"${String(s || '').replace(/"/g, '""')}"`;
  const rows = [
    ['Date', 'Type', 'Category', 'Description', 'Amount (GBP)'].join(','),
    ...transactions.map(t => [
      new Date(t.date).toISOString().slice(0, 10),
      t.type, t.category, esc(t.description), t.amount.toFixed(2),
    ].join(',')),
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition',
    `attachment; filename="spendsmart-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(rows.join('\n'));
});

// GET /api/transactions/export/pdf
const exportPDF = asyncHandler(async (req, res) => {
  const filter       = buildExportFilter(req.user._id, req.query);
  const transactions = await Transaction.find(filter).sort('-date').lean();
  const user         = req.user;

  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance       = totalIncome - totalExpenses;

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition',
    `attachment; filename="spendsmart-${new Date().toISOString().slice(0, 10)}.pdf"`);
  doc.pipe(res);

  // ── Header ─────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 70).fill('#1a1d27');
  doc.fontSize(22).fillColor('#6c63ff').text('SpendSmart', 40, 20);
  doc.fontSize(10).fillColor('#8b90b8').text('Transaction Report', 40, 46);
  doc.fillColor('#e8eaf6').text(`${user.name}  ·  ${user.email}`, 40, 46, { align: 'right' });
  doc.fillColor('#8b90b8').fontSize(9)
    .text(`Generated: ${new Date().toLocaleString('en-GB')}`, 40, 58, { align: 'right' });

  // ── Summary ─────────────────────────────────────────────────
  let y = 90;
  doc.fillColor('#e8eaf6').fontSize(13).font('Helvetica-Bold').text('Summary', 40, y);
  y += 18;
  doc.moveTo(40, y).lineTo(555, y).strokeColor('#2e3250').stroke();
  y += 8;

  [
    ['Total Income',   `£${totalIncome.toFixed(2)}`,   '#43e97b'],
    ['Total Expenses', `£${totalExpenses.toFixed(2)}`,  '#ff6584'],
    ['Balance',        `£${balance.toFixed(2)}`,        balance >= 0 ? '#43e97b' : '#ff6584'],
    ['Transactions',   String(transactions.length),     '#8b90b8'],
  ].forEach(([label, value, color]) => {
    doc.fontSize(10).font('Helvetica').fillColor('#8b90b8').text(`${label}:`, 40, y);
    doc.fillColor(color).font('Helvetica-Bold').text(value, 220, y);
    y += 18;
  });

  // ── Table ───────────────────────────────────────────────────
  y += 10;
  doc.fillColor('#e8eaf6').fontSize(13).font('Helvetica-Bold').text('All Transactions', 40, y);
  y += 18;
  doc.moveTo(40, y).lineTo(555, y).strokeColor('#2e3250').stroke();
  y += 8;

  doc.fillColor('#8b90b8').fontSize(9).font('Helvetica-Bold');
  doc.text('Date', 42, y); doc.text('Type', 115, y); doc.text('Category', 175, y);
  doc.text('Description', 270, y); doc.text('Amount', 460, y, { width: 93, align: 'right' });
  y += 14;
  doc.moveTo(40, y).lineTo(555, y).strokeColor('#2e3250').stroke();
  y += 6;

  transactions.forEach((t, idx) => {
    if (y > 760) { doc.addPage(); y = 40; }
    doc.rect(40, y - 3, 515, 18).fill(idx % 2 === 0 ? '#1a1d27' : '#22263a');
    doc.fillColor('#8b90b8').fontSize(8).font('Helvetica')
      .text(new Date(t.date).toLocaleDateString('en-GB'), 42, y);
    doc.fillColor(t.type === 'income' ? '#43e97b' : '#ff6584').text(t.type, 115, y);
    doc.fillColor('#8b90b8').text(t.category, 175, y);
    doc.fillColor('#e8eaf6').text((t.description || '').substring(0, 25), 270, y);
    doc.fillColor(t.type === 'income' ? '#43e97b' : '#ff6584').font('Helvetica-Bold')
      .text(`£${t.amount.toFixed(2)}`, 460, y, { width: 93, align: 'right' });
    y += 18;
  });

  doc.fontSize(8).fillColor('#8b90b8')
    .text('SpendSmart — Track every penny. Save with purpose.', 40, 800, { align: 'center', width: 515 });
  doc.end();
});

module.exports = { exportCSV, exportPDF };
