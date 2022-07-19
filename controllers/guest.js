const Item = require('../models/item');
const Menu = require('../models/menu');
const User = require('../models/user');
const schedule = require('../util/menuSchedule');
const { itemRows } = require('../util/viewHelpers');

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

    let activeMenus = await Menu.get('menus', { active: 'true', start: { $lt: currentTime }, end: { $gt: currentTime } });
    
    activeMenus = await Promise.all(activeMenus.map(async (menu) => {
        return await Menu.populateProducts(menu);
    }));

    res.render('guest/menus', {
        docTitle: 'Menus',
        role: 'guest',
        path: '/guest/menus',
        menus: activeMenus,
    });
};

module.exports.getCart = async (req, res, next) => {

};

module.exports.postCart = async (req, res, next) => {
    const menus = req.body.menus;
    let orderedItems = [];

    orderedItems = menus.flatMap(menu => menu.items.filter(item => +item.qty > 0));
    
    await User.updateCart(req.user._id, orderedItems);

    cartItems = await Promise.all(orderedItems
        .map(async (item, index) => {
            item.detail = await Item.findById('items', item._id, { projection: { price: 1, title: 1, _id: 0 } });
            return item;
        }));
    
    res.render('guest/cart', {
        docTitle: 'Cart',
        role: 'guest',
        path: '/guest/cart',
        items: cartItems,
    });
};