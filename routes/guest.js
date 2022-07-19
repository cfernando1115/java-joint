const express = require('express');

const isAuth = require('../middleware/isAuthenticated');
const guestController = require('../controllers/guest');

const router = express.Router();

router.get('/', isAuth, guestController.getIndex);

router.get('/menus', isAuth, guestController.getMenus);

router.get('/cart', isAuth, guestController.getCart);

router.post('/cart', isAuth, guestController.postCart);

module.exports = router;