const ProjectModel = require('../models/projectModel');
const { successResponse, errorResponse, sanitizeString } = require('../utils/helpers');

const ProjectsController = {
  /**
   * Get all portfolio projects (Public API)
   */
  async getAllProjects(req, res) {
    try {
      const { category, featured } = req.query;
      const projects = ProjectModel.findAll({
        category: category || null,
        featuredOnly: featured === 'true'
      });

      return successResponse(res, projects, 'Projects retrieved successfully');
    } catch (err) {
      console.error('[ProjectsController.getAllProjects]', err);
      return errorResponse(res, 'Failed to fetch projects.', 500);
    }
  },

  /**
   * Get project by ID (Public API)
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = ProjectModel.findById(id);

      if (!project) {
        return errorResponse(res, 'Project not found.', 404);
      }

      return successResponse(res, project, 'Project details retrieved');
    } catch (err) {
      console.error('[ProjectsController.getProjectById]', err);
      return errorResponse(res, 'Failed to retrieve project.', 500);
    }
  },

  /**
   * Create new project (Protected Admin API)
   */
  async createProject(req, res) {
    try {
      const {
        id,
        title,
        category,
        client,
        timeline,
        tools,
        deliverables,
        image,
        challenge,
        solution,
        featured,
        sort_order
      } = req.body;

      if (!title || !category || !image) {
        return errorResponse(res, 'Title, category, and image URL are required.', 422);
      }

      const newProject = ProjectModel.create({
        id: id ? sanitizeString(id) : null,
        title: sanitizeString(title),
        category: sanitizeString(category),
        client: sanitizeString(client || 'Client Spec'),
        timeline: sanitizeString(timeline || '2-3 Weeks'),
        tools: sanitizeString(tools || 'Blender, After Effects'),
        deliverables: sanitizeString(deliverables || '4K Render, Social Edits'),
        image: image.trim(),
        challenge: sanitizeString(challenge || ''),
        solution: sanitizeString(solution || ''),
        featured: featured !== undefined ? Boolean(featured) : true,
        sort_order: parseInt(sort_order, 10) || 0
      });

      return successResponse(res, newProject, 'Portfolio project created successfully', 201);
    } catch (err) {
      console.error('[ProjectsController.createProject]', err);
      return errorResponse(res, 'Failed to create project.', 500);
    }
  },

  /**
   * Update existing project (Protected Admin API)
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const existing = ProjectModel.findById(id);

      if (!existing) {
        return errorResponse(res, 'Project not found.', 404);
      }

      const updated = ProjectModel.update(id, req.body);
      return successResponse(res, updated, 'Project updated successfully');
    } catch (err) {
      console.error('[ProjectsController.updateProject]', err);
      return errorResponse(res, 'Failed to update project.', 500);
    }
  },

  /**
   * Delete project (Protected Admin API)
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const existing = ProjectModel.findById(id);

      if (!existing) {
        return errorResponse(res, 'Project not found.', 404);
      }

      ProjectModel.delete(id);
      return successResponse(res, null, 'Project deleted successfully');
    } catch (err) {
      console.error('[ProjectsController.deleteProject]', err);
      return errorResponse(res, 'Failed to delete project.', 500);
    }
  }
};

module.exports = ProjectsController;
