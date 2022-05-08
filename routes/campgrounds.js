const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const { isLoggedIn, validateCampground, isAuthor } = require('../utils/middleware');

//advanced route setup alternative
// '/' route group
router.route('/').get(catchAsync(campgrounds.index)).post(
    isLoggedIn,
    upload.array('image'), //multer data
    validateCampground,
    catchAsync(campgrounds.createCampground)
);

//create new campground form
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//id route group
router
    .route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
// Old route
//Route to render all campgrounds
// router.get('/', catchAsync(campgrounds.index));

//set Route as a post where the new form is submitted to
// router.post(
//     '/',
//     isLoggedIn,
//     validateCampground,
//     catchAsync(campgrounds.createCampground)
// );

// //Route to render campground detials page
// router.get('/:id', catchAsync(campgrounds.showCampground));

//Route to edit an existing campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

//Add a Put/Patch Route for edit campground form
// router.put(
//     '/:id',
//     isLoggedIn,
//     isAuthor,
//     validateCampground,
//     catchAsync(campgrounds.updateCampground)
// );

//Route to DELETE and entry
// router.delete(
//     '/:id',
//     isLoggedIn,
//     isAuthor,
//     catchAsync(campgrounds.deleteCampground)
// );

module.exports = router;
