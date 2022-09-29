const Ingredient = require('../models/ingredient');
const Item = require('../models/item');
const Menu = require('../models/menu');
const Category = require('../models/category');
const ingRows = require('../util/viewHelpers').ingredientRows;
const itemRow = require('../util/viewHelpers').itemRows;
const scheduleOptions = require('../util/menuSchedule').scheduleSelectOptions;
const fileHelper = require('../util/fileHelper');

const { validationResult } = require('express-validator');
const { itemRows } = require('../util/viewHelpers');

module.exports.getIndex = (req, res, next) => {
    res.render('manager/index', {
        docTitle: 'Manager',
        role: 'manager',
        path: ''
    });
};

module.exports.getIngredients = async (req, res, next) => {
    const ingredients = await Ingredient.getAll('ingredients');
    ingredients.sort((a, b) => (a.title > b.title) ? 1 : -1);

    res.render('manager/ingredients', {
        docTitle: 'Ingredients',
        role: 'manager',
        ingredients: ingredients,
        path: '/manager/ingredients'
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
        editing: false,
        path: '/manager/add-ingredient'
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
    const { title, price, id } = req.body;
    const image = req.file;

    const ing = await Ingredient.findById('ingredients', id);

    //update all items with the ingredient if price changes
    if (ing && ing.price !== +price) {
        await Item.updateItems(ing._id, price);
    }

    let updateDoc;

    if (ing) {
        const filter = { _id: ing._id };
        if (image) {
            fileHelper.deleteFile(ing.imagePath);
            const imageUrl = `${image.path}`;
            updateDoc = {
                $set: { title: title, price: price, imagePath: imageUrl }
            };
        } else {
            updateDoc = {
                $set: { title: title, price: price }
            };
        }

        await Ingredient.updateIngredient(filter, updateDoc);
    } else {

        if (!image) {
            return res.status(422).render('admin/edit-ingredient', {
                docTitle: 'Add Ingredient',
                path: '/admin/add-ingredient',
                editing: false,
                product: { title, price },
                hasError: true,
                errorMessage: 'Invalid image file',
                validationErrors: []
            });
        }

        const updatedIng = new Ingredient(title, price, image, id);

        await updatedIng.save('ingredients');
    }

    res.redirect('/manager/ingredients');
};

module.exports.postDeleteIngredient = async (req, res, next) => {
    const ingId = req.body.id;

    await Ingredient.deleteById('ingredients', ingId);

    Item.removeFromDocumentArray('items', 'recipe', ingId, 'ingredient');

    res.redirect('/manager/ingredients');
};

module.exports.getItems = async (req, res, next) => {
    const items = await Item.getAll('items');
    items.sort((a, b) => (a.title > b.title) ? 1 : -1);

    res.render('manager/items', {
        docTitle: 'Items',
        role: 'manager',
        items: items,
        path: '/manager/items'
    });
}

module.exports.getAddItem = async (req, res, next) => {
    const ingredients = await Ingredient.getDropdown('ingredients', { projection: { title: 1, price: 1 } });

    const categories = await Category.getAll('categories');
    categories.push({ title: 'Unassigned', main: 'false' });
    categories.sort((a, b) => (a.title > b.title) ? 1 : -1);

    res.render('manager/edit-item', {
        docTitle: 'Add Item',
        role: 'manager',
        editing: false,
        ingredients: ingredients,
        categories: categories,
        ingRows: ingRows,
        path: '/manager/add-item',
        valError: false,
        errorMessage: null,
        validationErrors: []
    });
};

module.exports.getEditItem = async (req, res, next) => {
    const itemId = req.params.id;

    const item = await Item.findById('items', itemId);

    if (!item) {
        return res.redirect('/manager');
    }

    const ingredients = await Ingredient.getDropdown('ingredients', { projection: { title: 1, price: 1 } });

    const categories = await Category.getAll('categories');
    categories.push({ title: 'Unassigned', main: 'false' });
    categories.sort((a, b) => (a.title > b.title) ? 1 : -1);

    res.render('manager/edit-item', {
        docTitle: 'Edit Item',
        role: 'manager',
        editing: true,
        ingredients: ingredients,
        categories: categories,
        item: item,
        ingRows: item.recipe.length === 0 ? ingRows : item.recipe.length,
        path: '/manager/edit-item',
        valError: false,
        errorMessage: null,
        validationErrors: []
    });
}

module.exports.postAddEditItem = async (req, res, next) => {
    const { title, categoryId, subcategoryId, price, description, imagePath, ingredients, id } = req.body;

    const errors = validationResult(req);

    let recipe = [];

    if (ingredients) {
        //prices change frequently...store refs for now
        recipe = await Promise.all(ingredients
            .filter(ing => ing._id && +ing.qty !== 0)
            .map(async (ing) => {
                return {
                    ingredient: await Ingredient.findById('ingredients', ing._id, { projection: { title: 1, price: 1 } }),
                    qty: +ing.qty
                };
            }));
    }

    const foodCost = parseFloat(recipe.reduce((acc, cur, i) => {
        return acc + (cur.ingredient.price * recipe[i].qty);
    }, 0)).toFixed(2);

    const foodCostPercentage = parseInt((foodCost / price) * 100);

    let category;
    let subcategory;

    if (categoryId) {
        category = await Category.findById('categories', categoryId, { projection: { title: 1, main: 1 } });
    }
    if (subcategoryId) {
        subcategory = await Category.findById('categories', subcategoryId, { projection: { title: 1, main: 1 } });
    }

    if (!errors.isEmpty()) {
        const ingredients = await Ingredient.getDropdown('ingredients', { projection: { title: 1, price: 1 } });
        const categories = await Category.getAll('categories');

        const item = { title, category, subcategory, price, description, imagePath, recipe, foodCost, foodCostPercentage, _id: id};

        return res.status(422).render('manager/edit-item', {
            path: id ? '/manager/edit-item' : '/manager/add-item',
            docTitle: id ? 'Edit Item' : 'Add Item',
            role: 'manager',
            editing: id ? true : false,
            ingredients: ingredients,
            categories: categories,
            valError: true,
            item: item,
            ingRows: item?.recipe?.length === 0 ? ingRows : item?.recipe?.length,
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg
        });
    }

    const newItem = new Item(title, category, subcategory, price, description, imagePath, recipe, foodCost, foodCostPercentage, id);
    await newItem.save('items');
 
    res.redirect('/manager/items');
};

module.exports.postDeleteItem = async (req, res, next) => {
    const itemId = req.body.id;

    await Item.deleteById('items', itemId);

    Menu.removeFromDocumentArray('menus', 'items', itemId);

    res.redirect('/manager/items');
};

module.exports.getMenus = async (req, res, next) => {
    const menus = await Menu.getDropdown('menus');
    res.render('manager/menus', {
        docTitle: 'Menus',
        role: 'manager',
        menus: menus,
        menuLoaded: false,
        path: '/manager/menus'
    });
};

module.exports.getMenu = async (req, res, next) => {
    const menuId = req.params.id;
    let menu = await Menu.findById('menus', menuId);

    if (menu.items) {
        menu = await Menu.populateProducts(menu);
    }
    
    res.send(JSON.stringify(menu));
};

module.exports.getAddMenu = async (req, res, next) => {
    const items = await Menu.getDropdown('items');
    res.render('manager/edit-menu', {
        docTitle: 'Add Menu',
        role: 'manager',
        items: items,
        itemRows: itemRows,
        scheduleOptions: scheduleOptions,
        editing: false,
        path: '/manager/add-menu'
    });
};

module.exports.getEditMenu = async (req, res, next) => {
    const menuId = req.params.id;
    const menu = await Menu.findById('menus', menuId);
        
    if (!menu) {
        return res.redirect('/manager');
    }

    menu.items = await Promise.all(menu.items
        .map(async (item, index) => {
            const { title } = await Item.getTitleById('items', item._id);
            item.title = title;
            return item;
        }));

    const items = await Menu.getDropdown('items', { projection: { title: 1, price: 1 } });

    res.render('manager/edit-menu', {
        docTitle: 'Edit Menu',
        role: 'manager',
        path: '/manager/edit-menu',
        editing: true,
        items: items,
        menu: menu,
        scheduleOptions: scheduleOptions,
        itemRows: menu.items.length === 0 ? itemRows : menu.items.length
    });
};

module.exports.postAddEditMenu = async (req, res, next) => {
    const { title, created, items, active, start, end, id } = req.body;

    let menuItems = [];

    if (items) {
        menuItems = items
            .filter(item => item._id !== '**Select Item**')
            .map((item, index) => {
                item.position = index + 1;
                return item;
            });
    }

    const newMenu = new Menu(title, created, menuItems, active, +start, +end, id);

    await newMenu.save('menus');
 
    res.redirect('/manager/menus');
};

module.exports.saveMenuOrder = async (req, res, next) => {
    const menuId = req.params.id;

    const { title, created, items } = req.body;

    const newMenu = new Menu(title, created, items, menuId);

    await newMenu.save('menus');

    res.send({ message: 'Order saved' });
};

module.exports.getMenuSchedule = async (req, res, next) => {
    const menus = await Menu.get('menus', { active: 'true' }, { projection: { title: 1, start: 1, end: 1 } });

    res.render('manager/menu-schedule', {
        docTitle: 'Menu Schedule',
        role: 'manager',
        menus: menus,
        scheduleOptions: scheduleOptions,
        successMessage: null,
        path: '/manager/menu-schedule'
    });
};

module.exports.postMenuSchedule = async (req, res, next) => {
    const menus = req.body.menu;

    if (menus.length > 0) {
        menus.forEach(async (menu) => {
            const currentMenu = await Menu.findById('menus', menu._id);

            if (currentMenu) {
                if (currentMenu.start !== menu.start || currentMenu.end !== menu.end) {
                    const updatedMenu = new Menu(currentMenu.title, currentMenu.created, currentMenu.items, currentMenu.active, +menu.start, +menu.end, menu._id);
                    await updatedMenu.save('menus');
                }
            }
        });
    }

    const updatedMenus = await Menu.get('menus', { active: 'true' }, { projection: { title: 1, start: 1, end: 1 } });

    res.render('manager/menu-schedule', {
        docTitle: 'Menu Schedule',
        role: 'manager',
        menus: updatedMenus,
        scheduleOptions: scheduleOptions,
        successMessage: 'Menu schedule saved',
        path: '/manager/menu-schedule'
    });
};

module.exports.getCategories = async (req, res, next) => {
    const categories = await Category.getAll('categories');
    categories.sort((a, b) => (a.title > b.title) ? 1 : -1);

    res.render('manager/categories', {
        docTitle: 'Categories',
        role: 'manager',
        categories: categories,
        path: '/manager/categories'
    });
};

module.exports.getAddCategory = async (req, res, next) => {
    res.render('manager/edit-category', {
        docTitle: 'Add Category',
        role: 'manager',
        editing: false,
        path: '/manager/add-category',
        valError: false,
        errorMessage: null,
        validationErrors: []
    });
};

module.exports.getEditCategory = async (req, res, next) => {
    const categoryId = req.params.id;

    const category = await Category.findById('categories', categoryId);

    if (!category) {
        return res.redirect('/manager');
    }

    res.render('manager/edit-category', {
        docTitle: 'Edit Category',
        role: 'manager',
        editing: true,
        category: category,
        path: '/manager/edit-category',
        valError: false,
        errorMessage: null,
        validationErrors: []
    });
};

module.exports.postAddEditCategory = async (req, res, next) => {
    const { title, main, id } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('manager/edit-category', {
            path: id ? '/manager/edit-category' : '/manager/add-category',
            docTitle: id ? 'Edit Category' : 'Add Category',
            role: 'manager',
            editing: id ? true : false,
            valError: true,
            category: { title, main, id },
            validationErrors: errors.array(),
            errorMessage: errors.array()[0].msg
        });
    }

    const newCategory = new Category(title, main, id);

    await newCategory.save('categories');

    res.redirect('/manager/categories');
};

module.exports.postDeleteCategory = async (req, res, next) => {
    const categoryId = req.body.id;

    const category = await Category.findById('categories', categoryId);

    await Category.deleteById('categories', categoryId);

    const deletedProp = category.main
        ? 'category._id'
        : 'subcategory._id';
        
    Item.removeOrphans('items', 'category', deletedProp, categoryId);

    res.redirect('/manager/categories');
};