const Report = require('../models/report');
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.index = async (req, res) => {
    const reports = await Report.find({})
        .populate('object')
    res.render('moderation/index', { reports });
}

module.exports.reportCampground = async (req, res) => {
    const campgroundReport = new Report({
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
    const reviewReport = new Report({
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
    const userReport = new Report({
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
    console.log(req.body);
    console.log(req.params);
    const { punishment, deletion } = req.body;
    const { id, model, modelId } = req.params;
    switch (punishment) {
        case 'warning':
            console.log('it will warn the user');
            break;

        case '5ban':
            console.log('it will give 5 day ban');
            break;

        case '15ban':
            console.log('it will give 15day ban');
            break;

        case 'permaban':
            console.log('it will permaba');
            break;
    }
    if (deletion) {
        if (model === 'Campground') {
            await Campground.findByIdAndDelete(modelId);
        } else if (model === 'Review') {
            await Review.findByIdAndDelete(modelId);
        }
    }
    await Report.findByIdAndDelete(id);
    req.flash('success', 'Action performed.')
    res.redirect('/moderation')
}