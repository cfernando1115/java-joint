const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');
const Item = require('./item');
const schedule = require('../util/menuSchedule');

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

        let updatedCart = [];
        let cartExpires = new Date().setTime(new Date().getTime() + schedule.cartDuration * 60 * 60 * 1000);

        const user = await User.findById('users', userId);
        if (user) {
            if (user.cart.items.length > 0 && new Date() < new Date(user.cart.expires)) {
                cartExpires = user.cart.expires;

                updatedCart = user.cart.items.slice();

                items.forEach(item => {
                    if (updatedCart.some(cartItem => cartItem._id === item._id)) { 
                        const updatedCartItemIndex = updatedCart.findIndex(i => i._id === item._id);
                        if (+item.qty !== 0) {

                            updatedCart[updatedCartItemIndex].qty = +item.qty;
                        } else {
                            updatedCart.splice(updatedCartItemIndex, 1);
                        }
                    } else {
                        updatedCart.push({ _id: item._id, qty: +item.qty });
                    }
                })
            } else {
                user.cart.items = [];
                updatedCart = items.filter(item => +item.qty !== 0)
                    .map(item => { 
                        return { _id: item._id, qty: +item.qty };
                    });
            }
            return db.collection('users')
                .updateOne({ _id: user._id }, { $set: { 'cart.items': updatedCart, 'cart.expires': cartExpires } });
        }
    };

    static async populateCart(userId) {
        const db = getDb();

        let cartItems = [];
        let cartExpires = new Date().setTime(new Date().getTime() + schedule.cartDuration * 60 * 60 * 1000);

        const user = await User.findById('users', userId);

        if (user && new Date() < new Date(user.cart.expires)) {
            cartItems = await Promise.all(user.cart.items
                .map(async (item) => {
                    item.detail = await Item.findById('items', item._id, { projection: { price: 1, title: 1, _id: 0 } });
                    return item;
                }));
        } else {
            db.collection('users')
                .updateOne({ _id: user._id }, { $set: { 'cart.items': [], 'cart.expires': null } });
        }

        return cartItems;
    };
};

module.exports = User;