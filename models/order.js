const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');

class Order extends Collection {
    constructor(items, user) {
        super();
        this.items = items;
        this.user = user;
        this.date = new Date().toLocaleDateString();
    };
};

module.exports = Order;