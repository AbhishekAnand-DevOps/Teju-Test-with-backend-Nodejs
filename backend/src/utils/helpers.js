const jwt = require('jsonwebtoken');
const config = require('../config/env');

const helpers = {
  signToken(payload) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  },

  verifyToken(token) {
    return jwt.verify(token, config.jwt.secret);
  },

  sanitizeString(val) {
    if (typeof val !== 'string') return '';
    return val.replace(/<[^>]*>?/gm, '').trim();
  },

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  successResponse(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  errorResponse(res, message = 'An error occurred', statusCode = 400, errors = null) {
    const payload = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };
    if (errors) {
      payload.errors = errors;
    }
    return res.status(statusCode).json(payload);
  }
};

module.exports = helpers;
