const express = require('express');

const managerValidators = require('../validators/manager');
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

router.post('/add-item', managerValidators.addEditItem, managerController.postAddEditItem);

router.get('/edit-item/:id', managerController.getEditItem);

router.post('/edit-item', managerValidators.addEditItem, managerController.postAddEditItem);

router.post('/delete-item', managerController.postDeleteItem);

router.get('/add-menu', managerController.getAddMenu);

router.post('/add-menu', managerController.postAddEditMenu);

router.get('/edit-menu/:id', managerController.getEditMenu);

router.post('/edit-menu', managerController.postAddEditMenu);

router.get('/menus', managerController.getMenus);

router.get('/menus/:id', managerController.getMenu);

router.post('/menus/save-order/:id', managerController.saveMenuOrder);

router.get('/categories', managerController.getCategories);

router.get('/add-category', managerController.getAddCategory);

router.post('/add-category', managerValidators.addEditCategory, managerController.postAddEditCategory);

router.get('/edit-category/:id', managerController.getEditCategory);

router.post('/edit-category', managerValidators.addEditCategory, managerController.postAddEditCategory);

router.post('/delete-category', managerController.postDeleteCategory);

module.exports = router;