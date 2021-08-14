const Ingredient = require('../models/ingredient');
const Item = require('../models/item');
const ingRows = require('../util/viewHelpers').ingredientRows;

module.exports.getIndex = (req, res, next) => {
    res.render('manager/index', {
        docTitle: 'Manager',
        role: 'manager'
    });
};

module.exports.getIngredients = async (req, res, next) => {
    const ingredients = await Ingredient.getAll();

    res.render('manager/ingredients', {
        docTitle: 'Ingredients',
        role: 'manager',
        ingredients: ingredients
    });
};

module.exports.getIngredient = async (req, res, next) => {
    const ingId = req.params.id;

    const ingredient = await Ingredient.findById(ingId);
};

module.exports.getAddIngredient = (req, res, next) => {
    res.render('manager/edit-ingredient', {
        docTitle: 'Add Ingredient',
        role: 'manager',
        editing: false
    });
};

module.exports.getEditIngredient = async (req, res, next) => {
    const ingId = req.params.id;

    const ingredient = await Ingredient.findById(ingId);

    if (!ingredient) {
        return res.redirect('/manager');
    }

    res.render('manager/edit-ingredient', {
        docTitle: 'Edit Ingredient',
        path: '/admin/edit-ingredient',
        editing: true,
        role: 'manager',
        ingredient: ingredient
    });
};

module.exports.postAddEditIngredient = async (req, res, next) => {
    const { title, price, imagePath, id } = req.body;
    
    const updatedIng = new Ingredient(title, price, imagePath, id);

    await updatedIng.save();

    res.redirect('/manager/ingredients');
};

module.exports.postDeleteIngredient = async (req, res, next) => {
    const ingId = req.body.id;

    await Ingredient.deleteById(ingId);

    res.redirect('/manager/ingredients');
};

module.exports.getItems = async (req, res, next) => {
    const items = await Item.getAll();

    res.render('manager/items', {
        docTitle: 'Items',
        role: 'manager',
        items: items
    });
}

module.exports.getAddItem = async (req, res, next) => {
    const ingredients = await Ingredient.getDropdown();
    res.render('manager/edit-item', {
        docTitle: 'Add Item',
        role: 'manager',
        editing: false,
        ingredients: ingredients,
        ingRows: ingRows
    });
};

module.exports.getEditItem = async (req, res, next) => {
    const itemId = req.params.id;

    const item = await Item.findById(itemId);

    if (!item) {
        return res.redirect('/manager');
    }

    const ingredients = await Ingredient.getDropdown();

    res.render('manager/edit-item', {
        docTitle: 'Add Item',
        role: 'manager',
        editing: true,
        ingredients: ingredients,
        item: item,
        ingRows: item.recipe.length
    });
}

module.exports.postAddEditItem = async (req, res, next) => {
    const { title, price, description, imagePath, ingredients, id } = req.body;
    let filteredIngredients = [];

    if (ingredients) {
        filteredIngredients = ingredients?.filter(ing => ing.title !== '**Select Ingredient**' && +ing.qty !== 0);
    }

    const newItem = new Item(title, price, description, imagePath, filteredIngredients, id);
    await newItem.save();
 
    res.redirect('/manager/items');
}

module.exports.postDeleteItem = async (req, res, next) => {
    const itemId = req.body.id;

    await Item.deleteById(itemId);

    res.redirect('/manager/items');
};