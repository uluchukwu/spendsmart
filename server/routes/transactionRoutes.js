const express  = require('express');
const {
  getTransactions, createTransaction, getSummary,
  getTransaction, updateTransaction, deleteTransaction,
  getMonthlyHistory,
} = require('../controllers/transactionController');
const { exportCSV, exportPDF } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');
const { transactionValidators } = require('../validators/transactionValidators');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();
router.use(protect);

// NOTE: named routes must come before /:id to avoid param conflicts
router.get('/summary', getSummary);
router.get('/monthly', getMonthlyHistory);
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);

router.route('/')
  .get(getTransactions)
  .post(transactionValidators, validate, createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(transactionValidators, validate, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
