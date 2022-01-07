const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Parse incoming form submissions so it won't return empty
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
   res.render('home');
});

//Route to render all campgrounds
app.get(
   '/campgrounds',
   catchAsync(async (req, res) => {
      const campgrounds = await Campground.find({});
      res.render('campgrounds/index', { campgrounds });
   })
);

//Route to create/add new campgrounds
//no need to make async since we are only rendering a form
//make sure this route comes first before campgrounds/:id so it will be treated as a separate route and not an id
app.get('/campgrounds/new', (req, res) => {
   res.render('campgrounds/new');
});

//set Route as a post where the new form is submitted to
app.post(
   '/campgrounds',
   catchAsync(async (req, res, next) => {
      if (!req.body.campground) throw new ExpressError('Invalid Campground Data');
      const campground = new Campground(req.body.campground);
      await campground.save();
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//Route to render campground detials page
app.get(
   '/campgrounds/:id',
   catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      res.render('campgrounds/show', { campground });
   })
);

//Route to edit an existing campground
app.get(
   '/campgrounds/:id/edit',
   catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      res.render('campgrounds/edit', { campground });
   })
);

//Add a Put/Patch Route for edit campground form
app.put(
   '/campgrounds/:id',
   catchAsync(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
      res.redirect(`/campgrounds/${campground._id}`);
   })
);

//Route to delete and entry
app.delete(
   '/campgrounds/:id',
   catchAsync(async (req, res) => {
      const { id } = req.params;
      await Campground.findByIdAndDelete(id);
      res.redirect('/campgrounds');
   })
);

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
