const Campground = require('../models/campground');
const Review = require('../models/review');
const { campgroundSchema, reviewSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError');
const middlewares = {};

middlewares.catchAsync = function (func) {
    return function (req, res, next) {
        func(req, res, next)
            .catch(function (error) {
                next(error);
            })
    }
}

middlewares.isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        req.flash('error', 'Denied')
        res.redirect('/login')
    } else {
        next();
    }
}

middlewares.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do this!');
        res.redirect(`/campgrounds/${id}`);
    } else {
        next();
    }
}

middlewares.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to do this!');
        res.redirect('/login');
    } else {
        next();
    }
}

middlewares.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById({ _id: reviewId });
    const user = req.user._id;
    if (!user.equals(review.author)) {
        req.flash('error', 'You are not the creator of this review');
        res.redirect('/login');
    } else {
        next();
    }
}

middlewares.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(data => data.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
}

middlewares.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(data => data.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
}

module.exports = middlewares