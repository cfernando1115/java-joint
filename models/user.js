const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');

class User extends Collection {
    constructor(email, password, cart, id, resetToken = null, resetTokenExpiration = null) {
        super();
        this.email = email;
        this.password = password;
        this.cart = cart;
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

    static async updateCart(userId, items) {
        const db = getDb();

        const user = await User.findById('users', userId);

        if (user) {
            db.collection('users')
                .updateOne({ _id: user._id }, { $set: { 'cart.items': items } });
        }
    }
};

module.exports = User;