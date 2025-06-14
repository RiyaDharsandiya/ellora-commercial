// Example Express middleware
import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; // decoded should have user id and other info
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
