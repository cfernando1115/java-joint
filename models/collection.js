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

    static async removeOrphans(collectionName, deletedFromCollection, deletedProp, deletedId) {
        const db = getDb();

        await db.collection(collectionName)
            .updateMany({ [deletedProp]: new mongodb.ObjectId(deletedId) }, { $unset: { [deletedFromCollection]: '' } })      
    };

    static async removeFromDocumentArray(collectionName, array, deletedId, arrayProp = null) {
        const db = getDb();

        const collection = await Collection.getAll(collectionName);

        collection.forEach(async (item) => {
            if (arrayProp) {
                item[array] = item[array].filter(i => i[arrayProp]._id.toString() != deletedId);
            } else {
                item[array] = item[array].filter(i => i._id.toString() != deletedId);
            }

            await db.collection(collectionName)
                .updateOne({ _id: item._id }, { $set: item });
        });
    };
};

module.exports = Collection;
