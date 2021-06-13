const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync'); //utils
const passport = require('passport'); //passportjs

const users = require('../controllers/users');

router.get('/register', users.registerFormRender);

router.post('/register', catchAsync(users.register));

router.get('/login', users.loginFormRender);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logoutFormRender);

router.get('/profile/:id', catchAsync(users.userProfileRender)) //get a specific profile

module.exports = router;