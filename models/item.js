const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

class Item {
    constructor(title, price, description, imagePath, recipe, id) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imagePath = imagePath;
        this.recipe = recipe;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
    }

    save() {
        const db = getDb();
        let dbTask;
        if (this._id) {
            dbTask = db.collection('items')
                .updateOne({ _id: this._id }, { $set: this });
        }
        else {
            dbTask = db.collection('items')
                .insertOne(this);
        }
        return dbTask;
    };

    static async getAll() {
        const db = getDb();
        return await db.collection('items').find()
            .toArray();
    };

    static async findById(itemId) {
        const db = getDb();

        return db.collection('items')
            .find({ _id: new mongodb.ObjectId(itemId) })
            .next();
    };

    static deleteById(itemId) {
        const db = getDb();
        return db.collection('items')
            .deleteOne(
                { _id: new mongodb.ObjectId(itemId) }
            );
    };

    static findByTitle(title) {
        const db = getDb();
        return db.collection('items')
            .find({ title: title })
            .next();
    }
}

module.exports = Item;