const Campground = require('../models/campground');
const User = require('../models/user')
const Review = require('../models/review');
const mongoose = require('mongoose');

const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mbxToken });
const escapeRegex = require('../utils/escapeRegex');

module.exports.index = async (req, res) => {
    const { query, sortby } = req.query;
    let campground = await Campground.find({});
    if (sortby) {
        if (sortby === 'mostrecent') {
            const regex = new RegExp(escapeRegex(query));
            campground = await Campground
                .find({ title: regex })
                .sort({ createdAt: 'descending' });
        } else if (sortby === 'mostupdated') {
            const regex = new RegExp(escapeRegex(query));
            campground = await Campground
                .find({ title: regex })
                .sort({ updatedAt: 'descending' })
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

module.exports.rating = async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log(user)
    const hasLiked = await Campground.find({
        like: {
            $in: req.user._id
        }
    })
    const hasDisliked = await Campground.find({
        dislike: {
            $in: req.user._id
        }
    })
    const { status } = req.body
    if (status === "like") {
        if (hasLiked.length) {
            console.log('you dont like twice');
            return;
        } else if (hasDisliked.length) {
            console.log('this guy disliked, pull from dislike and push to like');
            const campground = await Campground.findByIdAndUpdate(req.params.id, {
                $pull: {
                    dislike: {
                        $in: req.user._id
                    }
                }
            })
            campground.like.push(req.user._id);
            await campground.save();
            return;
        } else {
            console.log('this guy never rated, push to like')
            const campground = await Campground.findById(req.params.id);
            campground.like.push(req.user._id);
            await campground.save();
        }
        return;
    } else if (status === "dislike") {
        if (hasDisliked.length) {
            console.log('you dont dislike twice');
            return;
        } else if (hasLiked.length) {
            console.log('this guy liked, pull from like to dislike');
            const campground = await Campground.findByIdAndUpdate(req.params.id, {
                $pull: {
                    like: {
                        $in: req.user._id
                    }
                }
            })
            campground.dislike.push(req.user._id);
            await campground.save();
            return;
        } else {
            console.log('never rated, push to dislike');
            const campground = await Campground.findById(req.params.id);
            campground.dislike.push(req.user._id);
            await campground.save();
        }
    }
    res.end();
}