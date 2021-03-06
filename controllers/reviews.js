const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.submitReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //in the show.ejs review forms we set the names of input to review[name] ==> all inputs under the key of review
    review.author = req.user._id;
    campground.reviews.push(review); //in our campgrounds model we added a review schema ref which is an array review objects
    await review.save(); //save to review database
    await campground.save(); //save to campground database
    req.flash('success', 'New review added successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    }); //get review Id from campgrounds database and update
    await Review.findByIdAndDelete(reviewId); //use reviewId we received and delete from Reviews database
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`); //redirect to campground detail page
};
