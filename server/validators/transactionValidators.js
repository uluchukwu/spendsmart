const { body } = require('express-validator');
const { CATEGORIES } = require('../models/Transaction');

const transactionValidators = [
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number')
    .custom((val) => {
      if (parseFloat(val) > 999_999_999) throw new Error('Amount cannot exceed 999,999,999');
      return true;
    }),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES).withMessage('Invalid category'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
];

module.exports = { transactionValidators };
