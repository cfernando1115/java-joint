const express = require('express');

const managerController = require('../controllers/manager');

const router = express.Router();

router.get('/', managerController.getIndex);

router.get('/add-ingredient', managerController.getAddIngredient);

router.post('/add-ingredient', managerController.postAddEditIngredient);

router.get('/ingredients', managerController.getIngredients);

router.get('/ingredients/:id', managerController.getIngredient);

router.get('/edit-ingredient/:id', managerController.getEditIngredient);

router.post('/edit-ingredient', managerController.postAddEditIngredient);

router.post('/delete-ingredient', managerController.postDeleteIngredient);

router.get('/items', managerController.getItems);

router.get('/add-item', managerController.getAddItem);

router.post('/add-item', managerController.postAddEditItem);

router.get('/edit-item/:id', managerController.getEditItem);

router.post('/edit-item', managerController.postAddEditItem);

router.post('/delete-item', managerController.postDeleteItem);

router.get('/add-menu', managerController.getAddMenu);

router.post('/add-menu', managerController.postAddEditMenu);

router.get('/menus', managerController.getMenus);

router.get('/menus/:id', managerController.getMenu);

module.exports = router;