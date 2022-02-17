const express = require('express');

const isAuth = require('../middleware/isAuthenticated');
const guestController = require('../controllers/guest');

const router = express.Router();

router.get('/', isAuth, guestController.getIndex);

module.exports = router;