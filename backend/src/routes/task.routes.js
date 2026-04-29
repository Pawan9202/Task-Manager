const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/task.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } = require('../utils/task.validation');

router.use(authenticate);

router.post('/', authorize('admin'), validate(createTaskSchema), createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', authorize('admin'), deleteTask);

module.exports = router;
