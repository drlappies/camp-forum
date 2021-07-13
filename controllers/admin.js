const Report = require('../models/report');
const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');
const moment = require('moment');
const currentTime = moment().clone();

module.exports.index = async (req, res) => {
    const reports = await Report.find({})
        .populate('object')
        .populate('suspect')
        .populate('informer')
    console.log(reports)
    res.render('moderation/index', { reports });
}

module.exports.reportCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const campgroundReport = new Report({
        suspect: campground.author,
        informer: req.user._id,
        reason: req.body.reason,
        description: req.body.description,
        object: req.params.id,
        model: 'Campground',
    })
    await campgroundReport.save();
    req.flash('success', 'You have successfully reported this post.')
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.reportReview = async (req, res) => {
    const review = await Review.findById(req.params.reviewId);
    const reviewReport = new Report({
        suspect: review.author,
        informer: req.user._id,
        reason: req.body.reason,
        description: req.body.description,
        object: req.params.reviewId,
        model: 'Review',
    })
    await reviewReport.save();
    req.flash('success', 'You have successfully reported this comment')
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.reportUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    const userReport = new Report({
        suspect: user._id,
        informer: req.user._id,
        reason: req.body.reason,
        description: req.body.description,
        object: req.params.id,
        model: 'User'
    })
    await userReport.save();
    req.flash('success', 'You have successfully report this user');
    res.redirect(`/profile/${req.params.id}`)
}

module.exports.reportDismiss = async (req, res) => {
    await Report.findByIdAndDelete(req.params.id);
    req.flash('success', 'Dismissed');
    res.redirect('/moderation')
}

module.exports.reportPunish = async (req, res) => {
    const { punishment, deletion } = req.body;
    const { id, model, modelId } = req.params;
    const report = await Report.findById(id);
    switch (punishment) {
        case 'permaban':
            await User.findByIdAndUpdate(report.suspect, {
                isBanned: true
            });
            break;
        case '5ban':
            await User.findByIdAndUpdate(report.suspect, {
                isBanned: true,
                bannedUntil: currentTime.add(5, 'day').toDate()
            })
            break;
        case '15ban':
            await User.findByIdAndUpdate(report.suspect, {
                isBanned: true,
                bannedUntil: currentTime.add(15, 'day').toDate()
            })
            break;
    }
    if (deletion) {
        if (model === 'Campground') {
            await Campground.findByIdAndDelete(modelId);
        } else if (model === 'Review') {
            await Review.findByIdAndUpdate(modelId, {
                body: 'This comment has been removed by a moderator',
                isBanned: true
            });
        }
    }
    await Report.findByIdAndDelete(id);
    req.flash('success', 'Action performed.')
    res.redirect('/moderation')
}