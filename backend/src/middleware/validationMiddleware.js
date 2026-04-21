import { z } from 'zod';

/**
 * Higher-order middleware to validate request body against a Zod schema.
 * @param {import('zod').ZodSchema} schema 
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    req.validatedBody = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};
