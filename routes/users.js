const express = require('express');
const router = express.Router();
const multer = require('multer');

const { catchAsync } = require('../middlewares/middlewares')
const passport = require('passport');
const users = require('../controllers/users');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

router.get('/register', users.registerFormRender);

router.post('/register', upload.single('profilePicture'), catchAsync(users.register));

router.get('/login', users.loginFormRender);

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

router.get('/profile', catchAsync(users.allProfiles));

router.get('/profile/:id', catchAsync(users.userProfileRender));

router.get('/profile/:id/edit', catchAsync(users.userProfileEditForm));

router.put('/profile/:id', upload.single('profilePicture'), catchAsync(users.userProfileEdit));

module.exports = router;