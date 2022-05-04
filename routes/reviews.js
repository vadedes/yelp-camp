const express = require('express');
//need to enable mergeParams because reviews are linked to campgrounds data
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const {
    validateReviews,
    isLoggedIn,
    isReviewAuthor,
} = require('../utils/middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

//Route for adding REVIEWS to a specific campground
router.post('/', isLoggedIn, validateReviews, catchAsync(reviews.submitReview));

//Route to delete a review from a campground
router.delete(
    '/:reviewId',
    isLoggedIn,
    isReviewAuthor,
    catchAsync(reviews.deleteReview)
);

module.exports = router;
