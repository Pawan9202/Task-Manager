const express = require('express');
const router = express.Router();
const { getDashboardStats, getProjectStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getDashboardStats);
router.get('/projects/:projectId', getProjectStats);

module.exports = router;
