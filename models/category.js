const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');

class Category extends Collection {
    constructor(title, main, id) {
        super();
        this.title = title;
        this.main = main;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
    };

    static getItemsByCategory(menus) {
        let allItems = menus.flatMap(menu => menu.items);

        allItems = allItems.filter((item, index, self) => {
            return index === self.findIndex((i) => (i.title === item.title));
        });

        let allCategories = [...new Set(allItems.map(item => item.category.title))];

        return allCategories.map(cat => {
            return {
                title: cat,
                items: allItems.filter(item => item.category.title === cat)
            };
        });
    }
};

module.exports = Category;