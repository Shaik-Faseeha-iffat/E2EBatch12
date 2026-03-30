const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      message: "Access Denied. No Token Provided."
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid Token Format"
    });
  }

  try {

    const jwtSecret = process.env.JWT_SECRET || 'foodconnectsecretkey';
    const verified = jwt.verify(token, jwtSecret);

    req.user = verified;

    next();

  } catch (error) {

    return res.status(400).json({
      message: "Invalid or Expired Token"
    });

  }
};

module.exports = verifyToken;
