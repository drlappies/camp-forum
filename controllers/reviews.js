const User = require('../models/user'); //models
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const { rating, body } = req.body;
    const currentUser = await User.findById(req.user._id);
    const review = new Review({
        author: currentUser._id,
        rating: rating,
        body: body
    })
    const campground = await Campground.findById(req.params.id);
    currentUser.reviews.push(review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    await currentUser.save();
    req.flash('success', 'Successfully created a review!');
    res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}