const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');

class User extends Collection {
    constructor(email, password, bill, id, resetToken = null, resetTokenExpiration = null) {
        super();
        this.email = email;
        this.password = password;
        this.bill = bill;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
        this.resetToken = resetToken;
        this.resetTokenExpiration = resetTokenExpiration;
    }

    static findByEmail(userEmail) {
        const db = getDb();

        return db.collection('users')
            .find({ email: userEmail })
            .next();
    };

    static findByToken(token) {
        const db = getDb();

        return db.collection('users')
            .find({ resetToken: token })
            .next();
    };
};

module.exports = User;