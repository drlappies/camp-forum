const express = require('express');
const router = express.Router();
const multer = require('multer');

const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

const { catchAsync, isLoggedIn, isAdmin, validateCampground } = require('../middlewares/middlewares');
const campgrounds = require('../controllers/campgrounds');

router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.newFormRender);

router.get('/:id', catchAsync(campgrounds.showOne));

router.get('/:id/edit', isLoggedIn, isAdmin, catchAsync(campgrounds.editFormRender));

router.put('/:id', isLoggedIn, isAdmin, upload.array('image'), validateCampground, catchAsync(campgrounds.edit));

router.post('/', isLoggedIn, upload.array('image'), catchAsync(campgrounds.new))

router.post('/:id', catchAsync(campgrounds.rating));

router.delete('/:id', isLoggedIn, isAdmin, catchAsync(campgrounds.delete));

module.exports = router;