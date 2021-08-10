const express = require('express');

const managerController = require('../controllers/manager');

const router = express.Router();

router.get('/', managerController.getIndex);

router.get('/add-ingredient', managerController.getAddIngredient);

router.post('/add-ingredient', managerController.postAddIngredient);

router.get('/ingredients', managerController.getIngredients);

router.get('/ingredients/:id', managerController.getIngredient);

router.get('/edit-ingredient/:id', managerController.getEditIngredient);

router.post('/edit-ingredient', managerController.postEditIngredient);

router.post('/delete-ingredient', managerController.postDeleteIngredient);

module.exports = router;