module.exports.getIndex = (req, res, next) => {
    res.render('../views/guest/index', {
        docTitle: 'Guest',
        role: 'guest'
    });
}