const { verifyToken, errorResponse } = require('../utils/helpers');
const UserModel = require('../models/userModel');

function authenticate(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Missing Bearer token.', 401);
    }

    const decoded = verifyToken(token);
    const user = UserModel.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'User session invalid or expired.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
}

module.exports = {
  authenticate
};
