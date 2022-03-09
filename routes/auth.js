const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/password-reset', authController.getPasswordReset);
router.post('/password-reset', authController.postPasswordReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;