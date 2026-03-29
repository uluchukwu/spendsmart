const express    = require('express');
const Budget     = require('../models/Budget');
const MonthlyCap = require('../models/MonthlyCap');
const protect    = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── Category budgets ───────────────────────────────────────

// GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.json({ success: true, data: budgets });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/budgets — upsert by category
router.post('/', async (req, res) => {
  try {
    const { category, monthlyLimit } = req.body;
    if (!category || !monthlyLimit)
      return res.status(400).json({ success: false, message: 'Category and limit required' });

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category },
      { monthlyLimit },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, data: budget });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// ── Monthly total cap ──────────────────────────────────────
// NOTE: /cap routes must come BEFORE /:category

// GET /api/budgets/cap
router.get('/cap', async (req, res) => {
  try {
    const cap = await MonthlyCap.findOne({ user: req.user._id });
    res.json({ success: true, data: cap || null });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/budgets/cap
router.post('/cap', async (req, res) => {
  try {
    const limit = parseFloat(req.body.limit);
    if (!limit || isNaN(limit) || limit <= 0)
      return res.status(400).json({ success: false, message: 'Valid cap amount required' });

    const cap = await MonthlyCap.findOneAndUpdate(
      { user: req.user._id },
      { limit },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, data: cap });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE /api/budgets/cap
router.delete('/cap', async (req, res) => {
  try {
    await MonthlyCap.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: 'Monthly cap removed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/budgets/:category
router.delete('/:category', async (req, res) => {
  try {
    await Budget.findOneAndDelete({ user: req.user._id, category: req.params.category });
    res.json({ success: true, message: 'Budget removed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
