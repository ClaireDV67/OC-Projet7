const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

// Logique des routes user
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;