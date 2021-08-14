module.exports.getIndex = (req, res, next) => {
    res.render('guest/index', {
        docTitle: 'Guest',
        role: 'guest'
    });
};