const express = require('express');

const managerController = require('../controllers/manager');

const router = express.Router();

router.get('/', managerController.getIndex);

router.get('/add-item', managerController.getAddItem);

module.exports = router;