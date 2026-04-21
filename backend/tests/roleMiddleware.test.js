import { describe, it, expect, vi } from 'vitest';
import { roleMiddleware } from '../src/middleware/roleMiddleware.js';

describe('roleMiddleware', () => {
  it('should allow access if user role is in the allowed roles', () => {
    const middleware = roleMiddleware('ADMIN', 'MANAGER');
    const req = { user: { role: 'ADMIN' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should deny access if user role is NOT in the allowed roles', () => {
    const middleware = roleMiddleware('ADMIN', 'MANAGER');
    const req = { user: { role: 'EMPLOYEE' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'FORBIDDEN',
      })
    );
  });
});
