const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validation.middleware');
const { signupSchema, loginSchema } = require('../utils/auth.validation');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authenticate, getProfile);

module.exports = router;
