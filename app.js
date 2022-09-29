const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const dbConnect = require('./util/db').dbConnect;
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const connectionString = require('./util/mongoConnection').connectionString;
const sessionSecret = require('./util/expressSessionSecret').sessionSecret;

const app = express();
const mongoDbStore = new MongoDBStore({
    uri: connectionString,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const csrfProtection = csrf();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/stylesheets/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, `${new Date().getTime()}_${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        return cb(null, true);
    } 
    cb(null, false);
}

app.use(multer({ storage: fileStorage, fileFilter }).single('image'));

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: mongoDbStore
}));

app.use(csrfProtection);
app.use(flash());

const errorController = require('./controllers/error');
const homeRoutes = require('./routes/home');
const managerRoutes = require('./routes/manager');
const guestRoutes = require('./routes/guest');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

app.use((req, res, next) => {
    res.locals.authenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (req.session && req.session.userId) {
        User.findById('users', req.session.userId)
            .then(user => {
                req.user = user;
                next();
        })
        .catch(err => {
            console.log(err);
        });
    }
    else {
        next();
    }
});

app.use('/manager', managerRoutes);
app.use('/guest', guestRoutes);
app.use(homeRoutes);
app.use(authRoutes);

app.use(errorController.error404);

dbConnect(() => {
    app.listen(3000);
})