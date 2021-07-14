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
        if (sortby === 'mostrecent') {
            const regex = new RegExp(escapeRegex(query));
            campground = await Campground
                .find({ title: regex })
                .sort({ createdAt: 'descending' })
        } else if (sortby === 'mostupdated') {
            const regex = new RegExp(escapeRegex(query));
            campground = await Campground
                .find({ title: regex })
                .sort({ updatedAt: 'descending' })
        } else if (sortby === 'mostreviewed') {
            const regex = new RegExp(escapeRegex(query))
            campground = await Campground
                .find({ title: regex })
                .sort({ reviewCount: 'descending' })
        } else if (sortby === 'mostpositive') {
            const regex = new RegExp(escapeRegex(query))
            campground = await Campground
                .find({ title: regex })
                .sort({ likeCount: 'descending' })
        }
    }
    res.render('campgrounds/index', { campground, query, sortby });
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
    const { tags } = req.body;
    const tagsArr = tags.split(",")
    console.log(tagsArr)
    const geoData = await geocodingClient.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send();
    if (req.files.length === 0) {
        req.flash('error', 'Image upload is mandatory');
        res.redirect('/campgrounds/new')
    }
    const campground = new Campground(req.body);
    campground.geometry = geoData.body.features[0].geometry;
    campground.image = req.files.map(files => ({ url: files.path, filename: files.filename }));
    campground.author = req.user._id;
    if (tagsArr[0].length !== 0) {
        tagsArr.forEach(el => {
            campground.tag.push(el)
        })
    }
    await campground.save();
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
    const hasLiked = await Campground.find({
        _id: req.params.id,
        like: {
            $in: req.user._id
        }
    })
    const hasDisliked = await Campground.find({
        _id: req.params.id,
        dislike: {
            $in: req.user._id
        }
    })
    const { status } = req.body
    if (status === "like") {
        if (hasLiked.length) {
            console.log(`${user} already liked this, cannot write in`);
            return;
        } else if (hasDisliked.length) {
            console.log(`${user} disliked before, pull from dislike and write in like`);
            const campground = await Campground.findByIdAndUpdate(req.params.id, {
                $pull: {
                    dislike: {
                        $in: req.user._id
                    }
                }
            })
            campground.like.push(req.user._id);
            campground.likeCount = campground.likeCount + 1;
            campground.dislikeCount = campground.dislikeCount - 1;
            await campground.save();
            return;
        } else {
            console.log(`${user} never rated before, write in like`)
            const campground = await Campground.findById(req.params.id);
            campground.like.push(req.user._id);
            campground.likeCount = campground.likeCount + 1;
            await campground.save();
        }
        return;
    } else if (status === "dislike") {
        if (hasDisliked.length) {
            console.log(`${user} already disliked, cannot write in`);
            return;
        } else if (hasLiked.length) {
            console.log(`${user} already liked, pull from like and write in dislike`);
            const campground = await Campground.findByIdAndUpdate(req.params.id, {
                $pull: {
                    like: {
                        $in: req.user._id
                    }
                }
            })
            campground.dislike.push(req.user._id);
            campground.dislikeCount = campground.dislikeCount + 1;
            campground.likeCount = campground.likeCount - 1;
            await campground.save();
            return;
        } else {
            console.log(`${user} never rated, write in dislike`);
            const campground = await Campground.findById(req.params.id);
            campground.dislike.push(req.user._id);
            campground.dislikeCount = campground.dislikeCount + 1;
            await campground.save();
        }
    }
    res.end();
}