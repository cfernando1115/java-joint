const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');
const Item = require('./item');

class Menu extends Collection {
    constructor(title, created, items, active, start, end, id) {
        super();
        this.title = title;
        this.created = created ?? new Date().toLocaleDateString();
        this.items = items;
        this.active = active;
        this.start = start;
        this.end = end;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
    };

    static findByTitle(title) {
        const db = getDb();

        return db.collection('menus')
            .find({ title: title })
            .next();
    }

    static async populateProducts(menu) {
        if (menu.items) {
            menu.items = await Promise.all(menu.items
                .map(async (item, index) => {
                    item = await Item.findById('items', item._id, { projection: { price: 1, title: 1, description: 1, imagePath: 1, category: 1 } });
                    item.position = menu.items[index].position;
                    return item;
                }));
        }
        
        return menu;
    }
};

module.exports = Menu;