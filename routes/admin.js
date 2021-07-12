const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin');
const { isAdmin, isLoggedIn, catchAsync } = require('../middlewares/middlewares');

router.get('/', isLoggedIn, isAdmin, catchAsync(admin.index));

router.post('/report/campgrounds/:id', isLoggedIn, catchAsync(admin.reportCampground));

router.post('/report/campgrounds/:id/review/:reviewId', isLoggedIn, catchAsync(admin.reportReview));

router.post('/report/user/:id', isLoggedIn, catchAsync(admin.reportUser));

router.post('/report/:id', isLoggedIn, isAdmin, catchAsync(admin.reportDismiss));

router.post('/report/:id/:model/:modelId', isLoggedIn, isAdmin, catchAsync(admin.reportPunish));

module.exports = router