const express = require('express');

const isAuth = require('../middleware/isAuthenticated');
const guestController = require('../controllers/guest');

const router = express.Router();

router.get('/', isAuth, guestController.getIndex);

router.get('/menus', isAuth, guestController.getMenus);

router.get('/cart', isAuth, guestController.getCart);

router.post('/cart', isAuth, guestController.postCart);

router.post('/order', isAuth, guestController.postOrder);

router.get('/orders', isAuth, guestController.getOrders);

router.get('/orders/:orderId', isAuth, guestController.getInvoice);

module.exports = router;