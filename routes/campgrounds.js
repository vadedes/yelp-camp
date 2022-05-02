const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../utils/middleware');

//validate campgrounds
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

//Route to render all campgrounds
router.get(
    '/',
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds });
    })
);

//Route to create/add new campgrounds
//no need to make async since we are only rendering a form
//make sure this route comes first before campgrounds/:id so it will be treated as a separate route and not an id
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

//set Route as a post where the new form is submitted to
router.post(
    '/',
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res, next) => {
        // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id; //assign newly created campground to current loggedIn user
        await campground.save();
        //flash when a new campground is created, create this on routes where we want a flash message to appear
        //We use a middleware at our entry point(app.js) so the flash "key" will show up on any route that we have flash message added
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

//Route to render campground detials page
router.get(
    '/:id',
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id)
            .populate('reviews')
            .populate('author');
        if (!campground) {
            req.flash('error', 'Cannot find that campground');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', { campground });
    })
);

//Route to edit an existing campground
router.get(
    '/:id/edit',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        if (!campground) {
            req.flash('error', 'Cannot find that campground');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', { campground });
    })
);

//Add a Put/Patch Route for edit campground form
router.put(
    '/:id',
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {
            ...req.body.campground,
        });
        req.flash('success', 'Successfully updated campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

//Route to DELETE and entry
router.delete(
    '/:id',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Campground successfully deleted');
        res.redirect('/campgrounds');
    })
);

module.exports = router;
