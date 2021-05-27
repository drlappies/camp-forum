const Review = require('../models/review');

module.exports = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById({ _id: reviewId });
    const user = req.user._id;
    if (!user.equals(review.author)){
        req.flash('error', 'You are not the creator of this review');
        res.redirect('/login');
    } else {
        next();
    }
}