const mongodb = require('mongodb');
const connectionString = require('./mongoConnection').connectionString;

const MongoClient = mongodb.MongoClient;

let _db;

const dbConnect = cb => {
    MongoClient.connect(connectionString)
        .then(result => {
            _db = result.db();
            cb();
        })
        .catch(error => {
            console.log(error);
        })
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'Database not found';
}

module.exports.dbConnect = dbConnect;
module.exports.getDb = getDb;