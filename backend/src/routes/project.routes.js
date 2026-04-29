const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/project.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createProjectSchema, updateProjectSchema } = require('../utils/project.validation');

router.use(authenticate);

router.post('/', authorize('admin'), validate(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', authorize('admin'), validate(updateProjectSchema), updateProject);
router.delete('/:id', authorize('admin'), deleteProject);
router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
