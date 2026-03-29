/**
 * Wraps an async Express route handler and forwards any rejected
 * promise to the global error middleware via next(err).
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
