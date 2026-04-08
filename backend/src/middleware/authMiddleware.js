import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
    const cookieToken = req.cookies?.accessToken;
    const token = bearerToken ?? cookieToken;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    console.log("DECODED TOKEN:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
