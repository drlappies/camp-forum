const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const { body } = req.body;
    const campground = await Campground.findById(req.params.id);
    const review = new Review({
        author: req.user._id,
        campground: campground,
        body: body
    })
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a review!');
    res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.createChildReview = async (req, res) => {
    const { body } = req.body;
    const { id, reviewId } = req.params;
    const parentReview = await Review.findById(reviewId);
    const childReview = new Review({
        author: req.user._id,
        body: body,
        campground: id,
        isParent: false
    })
    parentReview.children.push(childReview);
    await parentReview.save();
    await childReview.save();
    res.redirect(`/campgrounds/${id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}