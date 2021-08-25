const Ingredient = require('../models/ingredient');
const Item = require('../models/item');
const Menu = require('../models/menu');
const ingRows = require('../util/viewHelpers').ingredientRows;

module.exports.getIndex = (req, res, next) => {
    res.render('manager/index', {
        docTitle: 'Manager',
        role: 'manager'
    });
};

module.exports.getIngredients = async (req, res, next) => {
    const ingredients = await Ingredient.getAll('ingredients');

    res.render('manager/ingredients', {
        docTitle: 'Ingredients',
        role: 'manager',
        ingredients: ingredients
    });
};

module.exports.getIngredient = async (req, res, next) => {
    const ingId = req.params.id;

    const ingredient = await Ingredient.findById('ingredients', ingId);
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

    const ingredient = await Ingredient.findById('ingredients', ingId);

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

    const ing = await Ingredient.findById('ingredients', id);

    //update all items with the ingredient if price changes
    if (ing.price !== +price) {
        await Item.updateItems(ing._id, price);
    }
    
    const updatedIng = new Ingredient(title, price, imagePath, id);

    await updatedIng.save('ingredients');

    res.redirect('/manager/ingredients');
};

module.exports.postDeleteIngredient = async (req, res, next) => {
    const ingId = req.body.id;

    await Ingredient.deleteById('ingredients', ingId);

    res.redirect('/manager/ingredients');
};

module.exports.getItems = async (req, res, next) => {
    const items = await Item.getAll('items');

    res.render('manager/items', {
        docTitle: 'Items',
        role: 'manager',
        items: items
    });
}

module.exports.getAddItem = async (req, res, next) => {
    const ingredients = await Ingredient.getDropdown('ingredients', { projection: { title: 1, price: 1 } });
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

    const item = await Item.findById('items', itemId);

    if (!item) {
        return res.redirect('/manager');
    }

    const ingredients = await Ingredient.getDropdown('ingredients', { projection: { title: 1, price: 1 } });

    res.render('manager/edit-item', {
        docTitle: 'Edit Item',
        role: 'manager',
        editing: true,
        ingredients: ingredients,
        item: item,
        ingRows: item.recipe.length
    });
}

module.exports.postAddEditItem = async (req, res, next) => {
    const { title, price, description, imagePath, ingredients, id } = req.body;

    let itemIngs = [];

    if (ingredients) {
        //prices change frequently...store refs for now
        itemIngs = await Promise.all(ingredients
            .filter(ing => ing._id !== '**Select Ingredient**' && +ing.qty !== 0)
            .map(async (ing) => {
                return {
                    ingredient: await Ingredient.findById('ingredients', ing._id, { projection: { title: 1, price: 1 } }),
                    qty: +ing.qty
                };
            }));
    }

    const foodCost = parseFloat(itemIngs.reduce((acc, cur, i) => {
        return acc + (cur.ingredient.price * itemIngs[i].qty);
    }, 0)).toFixed(2);

    const foodCostPercentage = parseInt((foodCost / price) * 100);

    const newItem = new Item(title, price, description, imagePath, itemIngs, foodCost, foodCostPercentage, id);
    await newItem.save('items');
 
    res.redirect('/manager/items');
};

module.exports.postDeleteItem = async (req, res, next) => {
    const itemId = req.body.id;

    await Item.deleteById('items', itemId);

    res.redirect('/manager/items');
};

module.exports.getMenus = async (req, res, next) => {
    const menus = await Menu.getDropdown('menus');
    res.render('manager/menus', {
        docTitle: 'Menus',
        role: 'manager',
        menus: menus,
        menuLoaded: false
    });
};

module.exports.getMenu = async (req, res, next) => {
    const menuId = req.params.id;
    const menu = await Menu.findById('menus', menuId);
    
    res.send(JSON.stringify(menu));
};

module.exports.getAddMenu = async (req, res, next) => {
    const items = await Menu.getDropdown('items');
    res.render('manager/edit-menu', {
        docTitle: 'Add Menu',
        role: 'manager',
        items: items,
        itemRows: 6,
        editing: false
    });
};

module.exports.postAddEditMenu = async (req, res, next) => {
    const { title, created, items, id } = req.body;

    let menuItems = [];

    if (items) {
        //prices change frequently...store refs for now
        menuItems = await Promise.all(items
            .filter(item => item._id !== '**Select Item**')
            .map(async (item) => {
                return await Item.getTitleById('items', item._id);
            }));
    }

    const newMenu = new Menu(title, created, menuItems, id);

    await newMenu.save('menus');
 
    res.redirect('/manager');
};