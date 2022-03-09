const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

const User = require("../models/user");
const sendgrid = require("../util/sendgrid");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: sendgrid.apiKey
    }
}));

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
    catch (error) {
        console.log(error);
    }
};

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

        transporter.sendMail({
            to: email,
            from: sendgrid.senderEmail,
            subject: 'Thank you for signing up!',
            html: '<h1>Your signup was successful!</h1>'
        });
    
        res.redirect('/login');
    }
    catch (error) {
        console.log(error);
    }
};

module.exports.getPasswordReset = (req, res, next) => {
    res.render('auth/password-reset', {
        path: '/password-reset',
        docTitle: 'Reset Password',
        role: 'guest',
        errorMessage: req.flash('error')[0]
    });
};

module.exports.postPasswordReset = (req, res, next) => {
    const email = req.body.email;

    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            return res.redirect('/password-reset');
        }

        const token = buffer.toString('hex');

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                req.flash('error', 'No account found with that email');
                return res.redirect('/password-reset');
            }

            const resetToken = token;
            const resetTokenExpiration = Date.now() + 360000;

            const { password, bill, _id } = user;
            const updatedUser = new User(email, password, bill, _id, resetToken, resetTokenExpiration);

            await updatedUser.save('users');

            res.redirect('/');

            transporter.sendMail({
                to: email,
                from: sendgrid.senderEmail,
                subject: 'Password reset',
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a clicktracking="off" href="http://localhost:3000/reset/${token}">link </a>to set a new password</p>
                `
            });
        } catch (error) {
            console.log(error);
        }
    });
};

module.exports.getNewPassword = async (req, res, next) => {
    const token = req.params.token;

    try {
        const user = await User.findByToken(token);

        if (user) {
            res.render('auth/new-password', {
                path: '/new-password',
                docTitle: 'New Password',
                role: 'guest',
                userId: user._id.toString(),
                passwordToken: token,
                errorMessage: req.flash('error')[0]
            });
        }

    } catch (error) {
        console.log(error);
    }
};

module.exports.postNewPassword = async (req, res, next) => {
    const { newPassword, userId, passwordToken } = req.body;

    try {
        const user = await User.findByToken(passwordToken);

        if (user) {
            const { email, bill, _id } = user;
            const updatedPassword = await bcrypt.hash(newPassword, 12);
    
            const updatedUser = new User(email, updatedPassword, bill, _id);
    
            await updatedUser.save('users');
    
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
};