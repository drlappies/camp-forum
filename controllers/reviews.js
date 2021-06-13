const User = require('../models/user'); //models
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const { rating, body } = req.body;
    const currentUser = await User.findById(req.user._id); // who is making review right now
    const campground = await Campground.findById(req.params.id);
    const review = new Review({ //instantiate new review in db
        author: currentUser._id,
        campground: campground,
        rating: rating,
        body: body
    })
    currentUser.reviews.push(review); //push the review into User model
    campground.reviews.push(review); //push the review into Campground model
    await review.save(); //save all
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