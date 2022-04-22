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
};

module.exports = Category;