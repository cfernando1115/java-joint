const { check, body } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

module.exports.signup = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail()
        .custom(async (value, { req }) => {
            const existingUser = await User.findByEmail(value);
    
            if (existingUser) {
                throw new Error('Email already exists');
            }
        }),
    body('password')
        .isLength({ min: 4 })
        .withMessage('Password must be at least 4 characters')
        .isAlphanumeric()
        .withMessage('Password must contain only letters and numbers'),
    body('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords must match');
            }
            return true;
    })
];

module.exports.login = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail()
        .custom(async (value, { req }) => {
            const user = await User.findByEmail(value);

            if (!user) {
                throw new Error('User not found');
            }
            req.loggingInUser = user;
            return true;
        }),
    body('password', 'Invalid login')
        .isLength({ min: 4 })
        .isAlphanumeric()
        .custom(async (value, { req }) => {
            const result = await bcrypt.compare(value, req.loggingInUser.password);
            if (!result) {
                throw new Error();
            }
            return true;
        })
];
