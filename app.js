const express = require('express');
const path = require('path');
const dbConnect = require('./util/db').dbConnect;

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/stylesheets/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const errorController = require('./controllers/error');
const homeRoutes = require('./routes/home');
const managerRoutes = require('./routes/manager');
const guestRoutes = require('./routes/guest');


app.use('/manager', managerRoutes);
app.use('/guest', guestRoutes);
app.use(homeRoutes);

app.use(errorController.error404);

dbConnect(() => {
    app.listen(3000);
})