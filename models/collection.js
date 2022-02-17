const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

class Collection {
    save(collection) {
        const db = getDb();
        let dbTask;
        if (this._id) {
            dbTask = db.collection(collection)
                .updateOne({ _id: this._id }, { $set: this });
        }
        else {
            dbTask = db.collection(collection)
                .insertOne(this);
        }
        return dbTask;
    };

    static getAll(collection, projection) {
        const db = getDb();
        return db.collection(collection).find({},projection)
            .toArray();
    };

    static getTitleById(collection, id) {
        const db = getDb();

        return db.collection(collection)
            .find({ _id: new mongodb.ObjectId(id) }, {projection: { title: 1, _id: 0 }})
            .next();
    };

    static getRange(collection, ids, projection) {
        const db = getDb();
        return db.collection(collection).find({
            _id: {
                $in: ids.map(id => new mongodb.ObjectId(id))
            }

        }, projection).toArray();
    };

    static findById(collection, id, projection) {
        const db = getDb();

        return db.collection(collection)
            .find({ _id: new mongodb.ObjectId(id) }, projection)
            .next();
    };

    static deleteById(collection, id) {
        const db = getDb();

        return db.collection(collection)
            .deleteOne(
                { _id: new mongodb.ObjectId(id) }
            );
    };

    static getDropdown(collection, projection = { projection: { title: 1 } }) {
        const db = getDb();
        
        return db.collection(collection)
            .find({}, projection)
            .toArray();
    };
};

module.exports = Collection;
