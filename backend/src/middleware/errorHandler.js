export function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
}

export function errorHandler(err, req, res, _next) {
  const statusCode =
    Number.isInteger(err?.statusCode) && err.statusCode >= 400
      ? err.statusCode
      : 500;

  if (statusCode >= 500) {
    console.error('[api-error]', err);
  }

  const message =
    typeof err?.message === 'string' && err.message.trim() !== ''
      ? err.message
      : 'Something went wrong';

  res.status(statusCode).json({
    message,
    code: err?.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
  });
}
