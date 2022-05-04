const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds.js');

const {
    isLoggedIn,
    validateCampground,
    isAuthor,
} = require('../utils/middleware');

//Route to render all campgrounds
router.get('/', catchAsync(campgrounds.index));

//create new campground form
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//set Route as a post where the new form is submitted to
router.post(
    '/',
    isLoggedIn,
    validateCampground,
    catchAsync(campgrounds.createCampground)
);

//Route to render campground detials page
router.get('/:id', catchAsync(campgrounds.showCampground));

//Route to edit an existing campground
router.get(
    '/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm)
);

//Add a Put/Patch Route for edit campground form
router.put(
    '/:id',
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground)
);

//Route to DELETE and entry
router.delete(
    '/:id',
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
