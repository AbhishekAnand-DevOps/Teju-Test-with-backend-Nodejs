const { successResponse, errorResponse } = require('../utils/helpers');

const UploadController = {
  uploadFile(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file was uploaded.', 400);
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      return successResponse(res, {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }, 'File uploaded successfully', 201);
    } catch (err) {
      console.error('[UploadController.uploadFile]', err);
      return errorResponse(res, 'File upload processing failed.', 500);
    }
  }
};

module.exports = UploadController;
