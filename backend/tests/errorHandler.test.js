import { describe, it, expect, vi } from 'vitest';
import { notFoundHandler, errorHandler } from '../src/middleware/errorHandler.js';

describe('errorHandler middleware', () => {
  describe('notFoundHandler', () => {
    it('should return 404 with route info', () => {
      const req = { method: 'GET', originalUrl: '/bad-route' };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('/bad-route'),
        code: 'NOT_FOUND'
      }));
    });
  });

  describe('errorHandler', () => {
    it('should return 500 for generic errors', () => {
      const err = new Error('Boom');
      const req = {};
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler(err, req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'INTERNAL_ERROR'
      }));
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should respect err.statusCode if provided', () => {
      const err = { statusCode: 403, message: 'Forbidden Access', code: 'FORBIDDEN' };
      const req = {};
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      errorHandler(err, req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Forbidden Access',
        code: 'FORBIDDEN'
      }));
    });
  });
});
