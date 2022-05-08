if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

//Mongoose connection
main().catch((err) => {
    console.log('CONNECTION ERROR:');
    console.log(err);
}); //catch error

async function main() {
    await mongoose.connect('mongodb://localhost:27017/YelpCamp', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MONGO CONNECTION OPEN');
}

//express
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Parse incoming form submissions so it won't return empty
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
//add static public directory for production
app.use(express.static(path.join(__dirname, 'public')));

//add sessions
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 24 * 7, //Date.now() gives back time in milliseconds
        maxAge: 1000 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));
//use flash before route handlers
app.use(flash());

//Authenticate Using Passportjs
//initialize passport
app.use(passport.initialize());
//need passport.session() middleware if we want persistent login sessions
//make sure the session is used before passport.session()
app.use(passport.session());
//passport to use the local strategy and for that local strategy the authentication method is located in the user model called authenticate() - automatically added in the model by passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
//serialization is how do we store a user in the session - from plugin
passport.serializeUser(User.serializeUser());
//deserialize is how to get that user out of that session - from plugin
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user; //provides currentUser object to all templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//route to register a user with passport
app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'dave@test.com', username: 'dave' });
    const newUser = await User.register(user, 'monkey');
    res.send(newUser);
});

//campgrounds nested routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

//Route to 404 page
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404));
});

//main error handler middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});
