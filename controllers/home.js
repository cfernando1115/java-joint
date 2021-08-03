module.exports.getIndex = ((req, res, next) => {
    res.render('../views/home/index', {
        docTitle: 'JavaJoint',
        role: ''
    });
})