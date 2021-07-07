const User = require('../models/user');
const Review = require('../models/review');
const Campground = require('../models/campground');
const escapeRegex = require('../utils/escapeRegex');

module.exports.registerFormRender = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({
            username: username,
            email: email
        })
        if (req.files) {
            user.image.url = req.files.path
            user.image.filename = req.files.filename
        }
        const newUser = await User.register(user, password);
        req.login(newUser, (error) => {
            if (error) {
                next(error);
            } else {
                req.flash('success', `Welcome! ${req.user.username}!`);
                res.redirect('/campgrounds')
            }
        })
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
}

module.exports.loginFormRender = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', `Welcome back, ${req.user.username}!`);
    const redirectUrl = req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Bye!');
    res.redirect('/');
}

module.exports.allProfiles = async (req, res) => {
    const { query } = req.query;
    let users = await User.find({});
    if (query) {
        const regex = new RegExp(escapeRegex(query))
        users = await User.find({ username: regex });
    }
    res.render('users/users', { users })
}

module.exports.userProfileRender = async (req, res) => {
    const { id } = req.params;
    const { query, sortby } = req.query;
    const user = await User.findById(id);
    const reviews = await Review.find({})
        .populate('campground')
        .populate({
            path: 'directParent',
            populate: 'author'
        })
        .where('author').equals(user._id);
    let posts = await Campground.find({ author: user._id })
    console.log(reviews)

    if (sortby) {
        if (sortby === 'highestrated') {
            const regex = new RegExp(escapeRegex(query))
            posts = await Campground.find({ author: user._id, title: regex })
                .sort({ rating: 'descending' })
            return;
        } else if (sortby === 'lowestrated') {
            const regex = new RegExp(escapeRegex(query))
            posts = await Campground.find({ author: user._id, title: regex })
                .sort({ rating: 'ascending' })
            return;
        } else if (sortby === 'highestpriced') {
            const regex = new RegExp(escapeRegex(query))
            posts = await Campground.find({ author: user._id, title: regex })
                .sort({ pricing: 'descending' })
            return;
        } else if (sortby === 'lowestpriced') {
            const regex = new RegExp(escapeRegex(query))
            posts = await Campgrounds.find({ author: user._id, title: regex })
                .sort({ pricing: 'ascending' })
            return;
        } else if (sortby === 'mostreviewed') {
            const regex = new RegExp(escapeRegex(query))
            posts = await Campground.find({ author: user._id, title: regex })
                .sort({ reviews: 'descending' })
            return;
        } else if (sortby === 'nosort') {
            const regex = new RegExp(escapeRegex(query))
            posts = await Campground.find({ author: user._id, title: regex })
        }
    }
    res.render('users/profile', { user, reviews, posts });
}

module.exports.userProfileEditForm = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render('users/edit', { user })
}

module.exports.userProfileEdit = async (req, res) => {
    const { id } = req.params;
    const { about } = req.body;
    const user = await User.findByIdAndUpdate(id, {
        about: about
    });
    if (req.files) {
        user.icon.url = req.files.path,
            user.icon.filename = req.files.filename
    }
    await user.save()
    res.redirect(`/profile/${user._id}`)
}