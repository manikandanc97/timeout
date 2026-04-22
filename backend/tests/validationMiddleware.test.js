import { describe, it, expect, vi } from 'vitest';
import { validate } from '../src/middleware/validationMiddleware.js';
import { z } from 'zod';

describe('validationMiddleware', () => {
  it('should call next() if validation passes', () => {
    const schema = z.object({ name: z.string() });
    const req = { body: { name: 'Bob' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.validatedBody).toEqual({ name: 'Bob' });
  });

  it('should return 400 if validation fails', () => {
    const schema = z.object({ name: z.string() });
    const req = { body: { name: 123 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Validation failed'
    }));
    expect(next).not.toHaveBeenCalled();
  });
});
