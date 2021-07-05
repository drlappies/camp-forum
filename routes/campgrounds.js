const express = require('express');
const router = express.Router();
const multer = require('multer');

const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

const catchAsync = require('../utils/catchAsync'); 
const isLoggedIn = require('../utils/isLoggedIn');
const isAuthor = require('../utils/isAuthor');
const validateCampground = require('../utils/validateCampground');

const campgrounds = require('../controllers/campgrounds'); 

router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.newFormRender);

router.get('/:id', catchAsync(campgrounds.showOne));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editFormRender));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.edit));

router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.new));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

module.exports = router;