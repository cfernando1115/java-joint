const getDb = require('../util/db').getDb;
const mongodb = require('mongodb');

const Collection = require('./collection');

class Item extends Collection{
    constructor(title, price, description, imagePath, recipe, foodCost, foodCostPercentage, id) {
        super();
        this.title = title;
        this.price = price;
        this.description = description;
        this.imagePath = imagePath;
        this.recipe = recipe;
        this.foodCost = foodCost;
        this.foodCostPercentage = foodCostPercentage;
        this._id = id
            ? new mongodb.ObjectId(id)
            : null;
    };

    static async updateItems(ingId, newPrice) {
        const db = getDb();

        const items = await db.collection('items')
            .find({ 'recipe.ingredient._id': new mongodb.ObjectId(ingId) }).toArray();
        
        const updatedItems = items.slice();
        
        updatedItems.map(item => {
            item.recipe.forEach(rec => {
                if (rec.ingredient._id.toString() === new mongodb.ObjectId(ingId).toString()) {
                    rec.ingredient.price = newPrice;
                }
            });
            item.foodCost = parseFloat(item.recipe.reduce((acc, cur, i) => {
                return acc + (cur.ingredient.price * item.recipe[i].qty);
            }, 0)).toFixed(2);

            item.foodCostPercentage = parseInt((item.foodCost / item.price) * 100);

            db.collection('items')
                .updateOne({ _id: item._id }, { $set: item });
        });
    };
};

module.exports = Item;