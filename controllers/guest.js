const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit');

const Category = require('../models/category');
const Menu = require('../models/menu');
const User = require('../models/user');
const Item = require('../models/item');
const Order = require('../models/order');

module.exports.getIndex = (req, res, next) => {
    res.render('guest/index', {
        docTitle: 'Guest',
        role: 'guest',
        path: ''
    });
};

module.exports.getMenus = async (req, res, next) => {
    const current = new Date();
    const currentTime = current.getHours() + (current.getMinutes() / 60);
    let itemsByCategory = []

    let activeMenus = await Menu.get('menus', { active: 'true', start: { $lt: currentTime }, end: { $gt: currentTime } });
    activeMenus = await Promise.all(activeMenus.map(async (menu) => {
        return await Menu.populateProducts(menu);
    }));

    const userId = req.user._id;
    const user = await User.findById('users', userId);

    if (user) {
        itemsByCategory = Category.getItemsByCategory(activeMenus);
        
        itemsByCategory.forEach(menu => {
            menu.items.forEach(item => {
                if (user.cart.items.some(i => i._id.toString() === item._id.toString())) {
                    const existingItem = user.cart.items.find(userItem => userItem._id.toString() === item._id.toString());
                    item.qty = +existingItem.qty;
                } else {
                    item.qty = 0;
                }
            });
        });
    }

    res.render('guest/menus', {
        docTitle: 'Menus',
        role: 'guest',
        path: '/guest/menus',
        menus: itemsByCategory,
    });
};

module.exports.getCart = async (req, res, next) => {
    const cartItems = await User.populateCart(req.user._id);

    const current = new Date();
    const currentTime = current.getHours() + (current.getMinutes() / 60);

    let activeMenus = await Menu.get('menus', { active: 'true', start: { $lt: currentTime }, end: { $gt: currentTime } });
    const allItems = activeMenus.flatMap(menu => menu.items);
    let total = 0;

    cartItems.forEach(cartItem => {
        if (!allItems.some(item => item._id.toString() === cartItem._id.toString())) {
            cartItem.expired = true;
            cartItem.qty = 0;
        } else {
            cartItem.expired = false;
        }
        total += (+cartItem.detail.price * +cartItem.qty);
    });

    cartItems.total = total.toFixed(2);

    res.render('guest/cart', {
        docTitle: 'Cart',
        role: 'guest',
        path: '/guest/cart',
        items: cartItems,
    });
};

module.exports.postCart = async (req, res, next) => {
    const menus = req.body.menus;

    if (menus) {
        const cartItems = menus.flatMap(menu => menu.items.filter(item => +item.qty > 0));
        await User.updateCart(req.user._id, cartItems);
    }

    res.redirect('/guest/cart');
};

module.exports.postOrder = async (req, res, next) => {
    const orderItems = req.body.items;

    if (orderItems) {
        const user = await User.findById('users', req.user._id);

        if (user) {
            await User.updateCart(req.user._id, orderItems);
    
            const items = await Promise.all(user.cart.items
                .map(async (item) => {
                    let orderItem = {};

                    orderItem.item = await Item.findById('items', item._id, { projection: { price: 1, title: 1, imagePath: 1 } });
                    orderItem.qty = item.qty;

                    return orderItem;
                }));

            const order = new Order(items, { email: user.email, userId: user._id });
        
            await order.save('orders');
        
            res.redirect('/guest/orders');
        }
    }
};

module.exports.getOrders = async (req, res, next) => {
    const userOrders = await Order.get('orders', { 'user.userId': req.user._id });
    
    res.render('guest/orders', {
        docTitle: 'Orders',
        role: 'guest',
        path: '/guest/orders',
        orders: userOrders,
        errorMessage: ''
    });
};

module.exports.getInvoice = async (req, res, next) => {
    const orderId = req.params.orderId;
    let order = await Order.findById('orders', orderId);
    
    let error;
    
    if (!order) {
        error = 'Order not found';
    }

    if (order && order.user.userId.toString() !== req.user._id.toString()) {
        error = 'Unauthorized';
    }

    if (error) {
        const userOrders = await Order.get('orders', { 'user.userId': req.user._id });
    
        return res.render('guest/orders', {
            docTitle: 'Orders',
            role: 'guest',
            path: '/guest/orders',
            orders: userOrders,
            errorMessage: error
        });
    }

    const invoiceName = `invoice_${orderId}.pdf`;
    const invoicePath = path.join('data', 'invoices', invoiceName);

    let totalPrice = order.items.reduce((prev, cur) => {
        return prev + cur.qty * +cur.item.price
    }, 0);

    const pdfDoc = new pdfDocument({size: 'LETTER'});
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    
    pdfDoc.image('public/img/logo.png', 15, 15, { fit: [75, 75], align: 'center', valign: 'center' });

    pdfDoc.fontSize(26).text('Receipt', 100, 30, {
        width: 410,
        align: 'center'
    });

    pdfDoc.fontSize(18).text('JavaJoint', 5, 100, {
        width: 100,
        align: 'center',
    }).moveDown(1);

    pdfDoc.fontSize(12).text(`Date: ${order.date}`, 15, 125);

    pdfDoc.fontSize(12).text(`Guest: ${order.user.email}`, 15, 140);

    pdfDoc.fontSize(12).text(`Order: ${order._id}`, 15, 155);

    pdfDoc.fontSize(12).text(`Total: $${totalPrice.toFixed(2)}`, 15, 170).moveDown(2);

    pdfDoc.fontSize(14).text('Items');

    pdfDoc.moveTo(15, pdfDoc.y).lineTo(400, pdfDoc.y).stroke().moveDown(1);

    order.items.forEach(item => {
        pdfDoc.fontSize(12).text(`${item.item.title} - ${item.qty} x $${item.item.price}`);
    });
    
    pdfDoc.moveDown(1);

    pdfDoc.moveTo(15, pdfDoc.y).lineTo(400, pdfDoc.y).stroke().moveDown(1);

    pdfDoc.fontSize(16).text(`Total Price: $${totalPrice.toFixed(2)}`);

    pdfDoc.end();   
}