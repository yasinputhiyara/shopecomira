export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized. Please log in as admin." });
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.adminId) {
      return res.status(401).json({ message: "Unauthorized. Please log in as admin." });
    }
    const role = req.session.adminRole;
    if (!allowedRoles.includes(role) && role !== "owner") {
      return res.status(403).json({
        message: "Forbidden: You do not have permissions for this action.",
      });
    }
    next();
  };
}
