const express = require('express');
const router = express.Router();

const authValidators = require('../validators/auth');
const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);
router.post('/login', authValidators.login, authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup', authValidators.signup, authController.postSignup);
router.get('/password-reset', authController.getPasswordReset);
router.post('/password-reset', authController.postPasswordReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;