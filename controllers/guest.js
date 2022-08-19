const Category = require('../models/category');
const Menu = require('../models/menu');
const User = require('../models/user');

module.exports.getIndex = (req, res, next) => {
    res.render('guest/index', {
        docTitle: 'Guest',
        role: 'guest',
        path: ''
    });
};

module.exports.getMenus = async (req, res, next) => {
    const current = new Date();
    const currentTime = current.getHours() + (current.getMinutes() / 60);
    let itemsByCategory = []

    let activeMenus = await Menu.get('menus', { active: 'true', start: { $lt: currentTime }, end: { $gt: currentTime } });
    activeMenus = await Promise.all(activeMenus.map(async (menu) => {
        return await Menu.populateProducts(menu);
    }));

    const userId = req.user._id;
    const user = await User.findById('users', userId);

    if (user) {
        itemsByCategory = Category.getItemsByCategory(activeMenus);
        
        itemsByCategory.forEach(menu => {
            menu.items.forEach(item => {
                if (user.cart.items.some(i => i._id.toString() === item._id.toString())) {
                    const existingItem = user.cart.items.find(userItem => userItem._id.toString() === item._id.toString());
                    item.qty = +existingItem.qty;
                } else {
                    item.qty = 0;
                }
            });
        });
    }

    res.render('guest/menus', {
        docTitle: 'Menus',
        role: 'guest',
        path: '/guest/menus',
        menus: itemsByCategory,
    });
};

module.exports.getCart = async (req, res, next) => {
    const cartItems = await User.populateCart(req.user._id);

    const current = new Date();
    const currentTime = current.getHours() + (current.getMinutes() / 60);

    let activeMenus = await Menu.get('menus', { active: 'true', start: { $lt: currentTime }, end: { $gt: currentTime } });
    const allItems = activeMenus.flatMap(menu => menu.items);
    let total = 0;

    cartItems.forEach(cartItem => {
        if (!allItems.some(item => item._id.toString() === cartItem._id.toString())) {
            cartItem.expired = true;
            cartItem.qty = 0;
        } else {
            cartItem.expired = false;
        }
        total += (+cartItem.detail.price * +cartItem.qty);
    });

    cartItems.total = total.toFixed(2);

    res.render('guest/cart', {
        docTitle: 'Cart',
        role: 'guest',
        path: '/guest/cart',
        items: cartItems,
    });
};

module.exports.postCart = async (req, res, next) => {
    const menus = req.body.menus;

    if (menus) {
        const cartItems = menus.flatMap(menu => menu.items.filter(item => +item.qty > 0));
        await User.updateCart(req.user._id, cartItems);
    }

    res.redirect('/guest/cart');
};

module.exports.postOrder = async (req, res, next) => {
    const orderItems = req.body.items;

    if (orderItems) {
        await User.updateCart(req.user._id, orderItems);
    }
}