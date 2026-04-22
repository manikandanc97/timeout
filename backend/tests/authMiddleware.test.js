import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from '../src/middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { headers: {}, cookies: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
    vi.stubEnv('ACCESS_SECRET', 'secret');
  });

  it('should call next() if token is valid (Bearer)', () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 1, role: 'ADMIN' });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'secret');
    expect(req.user).toEqual({ id: 1, role: 'ADMIN' });
    expect(next).toHaveBeenCalled();
  });

  it('should call next() if token is valid (Cookie)', () => {
    req.cookies.accessToken = 'cookie-token';
    jwt.verify.mockReturnValue({ id: 2, role: 'EMPLOYEE' });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('cookie-token', 'secret');
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token is missing', () => {
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    req.headers.authorization = 'Bearer bad-token';
    jwt.verify.mockImplementation(() => { throw new Error('Invalid'); });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_TOKEN' }));
  });
});
