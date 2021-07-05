const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const { rating, body } = req.body;
    const campground = await Campground.findById(req.params.id);
    const review = new Review({
        author: req.user._id,
        campground: campground,
        rating: rating,
        body: body
    })
    campground.reviews.push(review);
    campground.rating = campground.rating + parseInt(rating)
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a review!');
    res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}