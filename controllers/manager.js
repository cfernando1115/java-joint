const Ingredient = require('../models/ingredient');

module.exports.getIndex = (req, res, next) => {
    res.render('../views/manager/index', {
        docTitle: 'Manager',
        role: 'manager'
    });
};

module.exports.getIngredients = async (req, res, next) => {
    const ingredients = await Ingredient.getAll();

    res.render('../views/manager/ingredients', {
        docTitle: 'Ingredients',
        role: 'manager',
        ingredients: ingredients
    });
};

module.exports.getIngredient = async (req, res, next) => {
    const ingId = req.params.id;

    const ingredient = await Ingredient.findById(ingId);
}

module.exports.getAddIngredient = (req, res, next) => {
    res.render('../views/manager/edit-ingredient', {
        docTitle: 'Add Ingredient',
        role: 'manager',
        editing: false
    });
};

module.exports.postAddIngredient = async (req, res, next) => {
    const { title, price, imagePath } = req.body;

    const ingredient = new Ingredient(title, price, imagePath);

    await ingredient.save();

    res.redirect('/manager/ingredients')
};

module.exports.getEditIngredient = async (req, res, next) => {
    const ingId = req.params.id;

    const ingredient = await Ingredient.findById(ingId);

    if (!ingredient) {
        return res.redirect('/manager');
    }

    res.render('../views/manager/edit-ingredient', {
        docTitle: 'Edit Ingredient',
        path: '/admin/edit-ingredient',
        editing: true,
        role: 'manager',
        ingredient: ingredient
    });
};

module.exports.postEditIngredient = async (req, res, next) => {
    const {title, price, imagePath, id} = req.body;
    
    const updatedIng = new Ingredient(title, price, imagePath, id);

    await updatedIng.save();

    res.redirect('/manager/ingredients');
}

module.exports.postDeleteIngredient = async (req, res, next) => {
    const ingId = req.body.id;

    await Ingredient.deleteById(ingId);

    res.redirect('/manager/ingredients');
}