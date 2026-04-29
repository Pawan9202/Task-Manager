const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);

module.exports = router;
