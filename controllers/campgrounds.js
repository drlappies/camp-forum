const Campground = require('../models/campground');
const User = require('../models/user')
const Review = require('../models/review');

const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mbxToken });
const escapeRegex = require('../utils/escapeRegex');

module.exports.index = async (req, res) => {
    const { query, sortby } = req.query;
    let campground = await Campground.find({});
    if (sortby) {
        if (sortby === 'highestrated') {
            const regex = new RegExp(escapeRegex(query))
            campground = await Campground.find({ title: regex })
                .sort({ rating: 'descending' })
            return;
        } else if (sortby === 'lowestrated') {
            const regex = new RegExp(escapeRegex(query))
            campground = await Campground.find({ title: regex })
                .sort({ rating: 'ascending' })
            return;
        } else if (sortby === 'highestpriced') {
            const regex = new RegExp(escapeRegex(query))
            campground = await Campground.find({ title: regex })
                .sort({ pricing: 'descending' })
            return;
        } else if (sortby === 'lowestpriced') {
            const regex = new RegExp(escapeRegex(query))
            campground = await Campgrounds.find({ title: regex })
                .sort({ pricing: 'ascending' })
            return;
        } else if (sortby === 'mostreviewed') {
            const regex = new RegExp(escapeRegex(query))
            campground = await Campground.find({ title: regex })
                .sort({ reviews: 'descending' })
            return;
        } else if (sortby === 'nosort') {
            const regex = new RegExp(escapeRegex(query))
            campground = await Campground.find({ title: regex })
        }
    }
    res.render('campgrounds/index', { campground });
}

module.exports.newFormRender = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.showOne = async (req, res) => {
    const { id } = req.params;
    const reviews = await Review.find({ campground: id, isParent: true }).populate('author');
    const campground = await Campground.findById(id)
        .populate('author')
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    } else {
        res.render('campgrounds/show', { campground, reviews });
    }
}

module.exports.editFormRender = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
}

module.exports.edit = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body });
    const imgs = req.files.map(files => ({ url: files.path, filename: files.filename }));
    campground.image.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let i of req.body.deleteImages) {
            await cloudinary.uploader.destroy(i);
        }
        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.new = async (req, res, next) => {
    const geoData = await geocodingClient.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    if (req.files.length === 0) {
        req.flash('error', 'Image upload is mandatory');
        res.redirect('/campgrounds/new')
    }
    const user = await User.findById(req.user._id)
    const campground = new Campground(req.body);
    campground.geometry = geoData.body.features[0].geometry;
    campground.image = req.files.map(files => ({ url: files.path, filename: files.filename }));
    campground.author = req.user._id;
    user.campground.push(campground);
    await campground.save();
    await user.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect('/campgrounds');
}