const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');

class User extends Collection {
    constructor(email, password, bill, id) {
        super();
        this.email = email;
        this.password = password;
        this.bill = bill;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
    }

    static findByEmail(userEmail) {
        const db = getDb();

        return db.collection('users')
            .find({ email: userEmail })
            .next();
    };
};

module.exports = User;