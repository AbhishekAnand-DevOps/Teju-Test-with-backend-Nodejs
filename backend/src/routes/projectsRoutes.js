const express = require('express');
const router = express.Router();
const ProjectsController = require('../controllers/projectsController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public endpoints to view portfolio projects
router.get('/', ProjectsController.getAllProjects);
router.get('/:id', ProjectsController.getProjectById);

// Protected endpoints for portfolio admin
router.post('/', authenticate, ProjectsController.createProject);
router.put('/:id', authenticate, ProjectsController.updateProject);
router.delete('/:id', authenticate, ProjectsController.deleteProject);

module.exports = router;
