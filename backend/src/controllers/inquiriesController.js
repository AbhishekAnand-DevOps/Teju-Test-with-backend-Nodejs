const InquiryModel = require('../models/inquiryModel');
const AnalyticsModel = require('../models/analyticsModel');
const EmailService = require('../services/emailService');
const { exportInquiriesToCsv } = require('../utils/csvExporter');
const { successResponse, errorResponse, sanitizeString, validateEmail } = require('../utils/helpers');

const InquiriesController = {
  /**
   * Submit a new client project brief (Public API with rate limiter)
   */
  async submitInquiry(req, res) {
    try {
      const { client_name, client_email, project_type, budget, timeline, project_brief } = req.body;

      // Validation
      if (!client_name || !client_name.trim()) {
        return errorResponse(res, 'Client name is required.', 422);
      }
      if (!client_email || !validateEmail(client_email)) {
        return errorResponse(res, 'A valid email address is required.', 422);
      }
      if (!project_brief || !project_brief.trim()) {
        return errorResponse(res, 'Project brief and deliverable details are required.', 422);
      }

      const cleanName = sanitizeString(client_name);
      const cleanEmail = client_email.trim().toLowerCase();
      const cleanType = sanitizeString(project_type || '3D CGI Commercial');
      const cleanTimeline = sanitizeString(timeline || '2-3 Weeks');
      const cleanBrief = sanitizeString(project_brief);
      const cleanBudget = parseInt(budget, 10) || 3500;
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

      // Insert into SQLite database
      const inquiry = InquiryModel.create({
        client_name: cleanName,
        client_email: cleanEmail,
        project_type: cleanType,
        budget: cleanBudget,
        timeline: cleanTimeline,
        project_brief: cleanBrief,
        ip_address: ip
      });

      // Log event to analytics
      AnalyticsModel.logEvent('inquiry_submitted', {
        inquiryId: inquiry.id,
        project_type: cleanType,
        budget: cleanBudget
      }, ip, req.headers['user-agent'] || '');

      // Send email notification asynchronously
      EmailService.notifyNewInquiry(inquiry).catch((err) => {
        console.error('[InquiriesController] Notification trigger error:', err.message);
      });

      return successResponse(res, {
        id: inquiry.id,
        client_name: inquiry.client_name,
        created_at: inquiry.created_at
      }, 'Your brief has been successfully submitted! Tejashwini will get back to you within 24 hours.', 201);
    } catch (err) {
      console.error('[InquiriesController.submitInquiry]', err);
      return errorResponse(res, 'Failed to process your inquiry. Please try again.', 500);
    }
  },

  /**
   * Get all inquiries (Protected Admin API)
   */
  async getInquiries(req, res) {
    try {
      const { status, project_type, search, page = 1, limit = 20 } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      const filterParams = {
        status: status || null,
        project_type: project_type || null,
        search: search || '',
        limit: limitNum,
        offset
      };

      const inquiries = InquiryModel.findAll(filterParams);
      const total = InquiryModel.countAll(filterParams);

      return successResponse(res, {
        inquiries,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }, 'Inquiries retrieved successfully');
    } catch (err) {
      console.error('[InquiriesController.getInquiries]', err);
      return errorResponse(res, 'Failed to retrieve inquiries.', 500);
    }
  },

  /**
   * Get single inquiry by ID (Protected Admin API)
   */
  async getInquiryById(req, res) {
    try {
      const { id } = req.params;
      const inquiry = InquiryModel.findById(id);

      if (!inquiry) {
        return errorResponse(res, 'Inquiry not found.', 404);
      }

      return successResponse(res, inquiry, 'Inquiry details retrieved');
    } catch (err) {
      console.error('[InquiriesController.getInquiryById]', err);
      return errorResponse(res, 'Failed to retrieve inquiry details.', 500);
    }
  },

  /**
   * Update inquiry status and admin notes (Protected Admin API)
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const allowedStatuses = ['new', 'in_discussion', 'proposal_sent', 'accepted', 'completed', 'archived'];
      if (status && !allowedStatuses.includes(status)) {
        return errorResponse(res, `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`, 400);
      }

      const existing = InquiryModel.findById(id);
      if (!existing) {
        return errorResponse(res, 'Inquiry not found.', 404);
      }

      InquiryModel.updateStatus(id, status || existing.status, notes !== undefined ? notes : existing.notes);
      const updated = InquiryModel.findById(id);

      return successResponse(res, updated, 'Inquiry updated successfully');
    } catch (err) {
      console.error('[InquiriesController.updateStatus]', err);
      return errorResponse(res, 'Failed to update inquiry status.', 500);
    }
  },

  /**
   * Delete an inquiry (Protected Admin API)
   */
  async deleteInquiry(req, res) {
    try {
      const { id } = req.params;
      const existing = InquiryModel.findById(id);
      if (!existing) {
        return errorResponse(res, 'Inquiry not found.', 404);
      }

      InquiryModel.delete(id);
      return successResponse(res, null, 'Inquiry deleted successfully');
    } catch (err) {
      console.error('[InquiriesController.deleteInquiry]', err);
      return errorResponse(res, 'Failed to delete inquiry.', 500);
    }
  },

  /**
   * Export inquiries to CSV (Protected Admin API)
   */
  async exportCsv(req, res) {
    try {
      const allInquiries = InquiryModel.getAllForExport();
      const csv = exportInquiriesToCsv(allInquiries);

      const filename = `tejashwini_inquiries_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    } catch (err) {
      console.error('[InquiriesController.exportCsv]', err);
      return errorResponse(res, 'Failed to export CSV.', 500);
    }
  }
};

module.exports = InquiriesController;
