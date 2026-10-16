const express = require('express');
const router = express.Router();
const InquiriesController = require('../controllers/inquiriesController');
const { authenticate } = require('../middlewares/authMiddleware');
const { inquiryLimiter } = require('../middlewares/rateLimiter');

// Public route for portfolio visitors to submit project briefs
router.post('/', inquiryLimiter, InquiriesController.submitInquiry);

// Protected routes for portfolio admin
router.get('/', authenticate, InquiriesController.getInquiries);
router.get('/export/csv', authenticate, InquiriesController.exportCsv);
router.get('/:id', authenticate, InquiriesController.getInquiryById);
router.patch('/:id/status', authenticate, InquiriesController.updateStatus);
router.delete('/:id', authenticate, InquiriesController.deleteInquiry);

module.exports = router;
