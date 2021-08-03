module.exports.getIndex = ((req, res, next) => {
    res.render('../views/manager/index', {
        docTitle: 'Manager',
        role: 'manager'
    });
});

module.exports.getAddItem = ((req, res, next) => {
    res.render('../views/manager/edit-item', {
        docTitle: 'Add Item',
        role: 'manager'
    });
});