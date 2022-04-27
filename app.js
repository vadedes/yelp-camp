const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//campgrounds nested routes
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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
