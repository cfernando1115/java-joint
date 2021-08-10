const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

class Ingredient {
    constructor(title, price, imagePath, id) {
        this.title = title;
        this.price = price;
        //this.description;
        this.imagePath = imagePath;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
    };

    save() {
        const db = getDb();
        let dbTask;
        if (this._id) {
            dbTask = db.collection('ingredients')
                .updateOne({ _id: this._id }, { $set: this });
        }
        else {
            dbTask = db.collection('ingredients')
                .insertOne(this);
        }
        return dbTask;
    };

    static async getAll() {
        const db = getDb();
        return await db.collection('ingredients').find()
            .toArray();
    };

    static async findById(ingId) {
        const db = getDb();

        return db.collection('ingredients')
            .find({ _id: new mongodb.ObjectId(ingId) })
            .next();
    };

    static deleteById(ingId) {
        const db = getDb();
        return db.collection('ingredients')
            .deleteOne(
                { _id: new mongodb.ObjectId(ingId) }
            );
    };
}

module.exports = Ingredient;