const bcrypt = require('bcryptjs');
const User = require("../models/user");

module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        docTitle: 'Login',
        role: 'guest',
        authenticated: false,
        errorMessage: req.flash('error')[0]
    });
};

module.exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByEmail(email);
        
        if (!user) {
            req.flash('error', 'invalid login');
            return res.redirect('/login');
        }

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.redirect('/login');
        }
    
        req.session.isLoggedIn = true;
        req.session.userId = user._id;
    
        req.session.save(err => {
            if (err) {
                console.log(err);
            }
            res.redirect('/guest');
        });
    }
    catch(error) {
        console.log(error);
    }
}

module.exports.postLogout = async (req, res, next) => {
    await req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
};

module.exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        docTitle: 'Sign Up',
        role: 'guest',
        authenticated: false,
        errorMessage: req.flash('error')[0]
    });
};

module.exports.postSignup = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    try {
        const existingUser = await User.findByEmail(email);
    
        if (existingUser) {
            req.flash('error', 'email is taken');
            return res.redirect('/signup');
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User(email, hashedPassword, bill = { items: [] });
    
        await user.save('users');
    
        res.redirect('/login');
    }
    catch(error) {
        console.log(error);
    }
}