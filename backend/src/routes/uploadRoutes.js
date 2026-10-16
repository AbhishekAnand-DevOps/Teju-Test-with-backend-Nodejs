const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
const UploadController = require('../controllers/uploadController');

// Upload single file (Protected Admin)
router.post('/', authenticate, upload.single('file'), UploadController.uploadFile);

module.exports = router;
