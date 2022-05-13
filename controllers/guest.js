const Item = require('../models/item');
const Menu = require('../models/menu');
const schedule = require('../util/menuSchedule');

module.exports.getIndex = (req, res, next) => {
    res.render('guest/index', {
        docTitle: 'Guest',
        role: 'guest',
        path: ''
    });
};

module.exports.getMenu = async (req, res, next) => {
    const current = new Date();
    let currentMenuTitle;

    if (current > schedule.open && current < schedule.close) {
        current < schedule.menuSchedule.lunch
            ? currentMenuTitle = schedule.breakfastMenu
            : current < schedule.menuSchedule.dinner
                ? currentMenuTitle = schedule.lunchMenu
                : currentMenuTitle = schedule.dinnerMenu;
    }

    let currentMenu = await Menu.findByTitle(currentMenuTitle);

    if (currentMenu.items) {
        currentMenu = await Menu.populateProducts(currentMenu);
    }

    console.log(currentMenu);

    res.render('guest/menu', {
        docTitle: 'Menu',
        role: 'guest',
        path: '/guest/menu'
    });
};