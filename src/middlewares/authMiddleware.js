import { verifyJwt } from "../utils/jwt.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
