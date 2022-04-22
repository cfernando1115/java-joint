const { check, body } = require('express-validator');
const bcrypt = require('bcryptjs');

//item
module.exports.addEditItem = [
    body('title')
        .trim()
        .isString()
        .isLength({ min: 2 })
        .withMessage('Item title is required'),
    body('categoryId')
        .trim()
        .isString()
        .isLength({ min: 2 })
        .withMessage('Category is required'),
    body('subcategoryId')
        .trim()
        .isString()
        .isLength({ min: 2 })
        .withMessage('Subcategory is required'),
    body('imagePath')
        .trim()
        .isURL()
        .withMessage('Please enter a valid image url'),
    body('ingredients')
        .custom((value) => {
            if (!value.some(val => val._id !== '')) {
                throw new Error('Please enter ingredient(s)');
            }
            return true;
        })
];

//category
module.exports.addEditCategory = [
    body('title')
        .trim()
        .isString()
        .isLength({ min: 3 })
        .withMessage('Category title must be at least 3 characters'),
    body('main')
        .trim()
        .isString()
        .isLength({ min: 4 })
        .withMessage('Please select a category type')
];