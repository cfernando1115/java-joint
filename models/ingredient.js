const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');

class Ingredient extends Collection {
    constructor(title, price, imagePath, id) {
        super();
        this.title = title;
        this.price = price;
        this.imagePath = imagePath;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
    };

    static async updateIngredient(filter, updateDoc) {
        const db = getDb();
        console.log(filter);
        console.log(updateDoc);
        await db.collection('ingredients')
            .updateOne(filter, updateDoc);
    };
};

module.exports = Ingredient;