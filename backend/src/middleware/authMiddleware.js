import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    const cookieToken = req.cookies?.accessToken;
    const token = bearerToken ?? cookieToken;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token missing',
        code: 'UNAUTHORIZED',
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;

    next();
  } catch {
    return res.status(403).json({
      message: 'Invalid or expired session',
      code: 'INVALID_TOKEN',
    });
  }
};
