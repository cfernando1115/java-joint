module.exports.getIndex = (req, res, next) => {
    res.render('home/index', {
        docTitle: 'JavaJoint',
        role: ''
    });
};