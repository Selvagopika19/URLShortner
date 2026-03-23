import { validationResult } from 'express-validator';

/**
 * Runs after express-validator chains; returns 400 with first error message.
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array({ onlyFirstError: true })[0]?.msg || 'Validation failed';
    return res.status(400).json({ success: false, message: msg });
  }
  next();
}
