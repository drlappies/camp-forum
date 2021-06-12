const User = require('../models/user'); //models

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

module.exports.logoutFormRender = (req, res) => {
    req.logout();
    req.flash('success', 'Bye!');
    res.redirect('/');
}