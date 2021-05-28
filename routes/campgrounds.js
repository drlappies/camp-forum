const express = require('express');
const router = express.Router();
const multer = require('multer');

const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

const catchAsync = require('../utils/catchAsync'); //utils
const isLoggedIn = require('../utils/isLoggedIn');
const isAuthor = require('../utils/isAuthor');
const validateCampground = require('../utils/validateCampground');
const validateImage = require('../utils/validateImage');

const campgrounds = require('../controllers/campgrounds'); //controllers

router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.newFormRender);

router.get('/:id', catchAsync(campgrounds.showOne));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editFormRender));

router.put('/:id', isLoggedIn, validateImage, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.edit));

router.post('/', isLoggedIn, validateImage, upload.array('image'), validateCampground, catchAsync(campgrounds.new));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

module.exports = router;