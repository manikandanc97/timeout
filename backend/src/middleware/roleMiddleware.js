export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    console.log("🧑 User Role:", req.user.role);
    console.log("✅ Allowed Roles:", roles);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};
