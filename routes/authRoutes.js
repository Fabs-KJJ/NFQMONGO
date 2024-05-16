const express = require('express');
const router = express.Router();

const jwtHelper = require('../helpers/jwtHelper');
const authController = require('../controller/auth');

// Apply verifyAccessToken middleware before routes that require authentication
router.post('/verifyAccessToken', jwtHelper.verifyAccessToken);

// Public Routes


module.exports = router;
