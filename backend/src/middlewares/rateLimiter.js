const rateLimit = require('express-rate-limit');
const config = require('../config/env');

// Standard API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Strict limiter for public inquiry form submissions (5 submissions per 10 minutes per IP)
const inquiryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many inquiries submitted from this connection. Please wait a few minutes before submitting another brief.'
  }
});

// Strict limiter for admin login (max 6 attempts per 15 minutes to prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. For security reasons, please wait 15 minutes before trying again.'
  }
});

module.exports = {
  apiLimiter,
  inquiryLimiter,
  authLimiter
};
