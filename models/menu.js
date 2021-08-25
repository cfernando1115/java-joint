const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');

class Menu extends Collection {
    constructor(title, created, items, id) {
        super();
        this.title = title;
        this.created = created ?? new Date().toLocaleDateString();
        this.items = items;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
    };
};

module.exports = Menu;