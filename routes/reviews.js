const express = require('express');
const router = express.Router({ mergeParams: true });

const { catchAsync, isLoggedIn, isReviewAuthor, validateReview } = require('../middlewares/middlewares')
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.post('/:reviewId', catchAsync(reviews.createChildReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;