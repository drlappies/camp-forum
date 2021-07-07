const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const isLoggedIn = require('../utils/isLoggedIn');
const isReviewAuthor = require('../utils/isReviewAuthor');
const validateReview = require('../utils/validateReview');

const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.post('/:reviewId', catchAsync(reviews.createChildReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;