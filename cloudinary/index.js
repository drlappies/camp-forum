const cloudinary = require('cloudinary').v2; //cloudinary api
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // multer-cloudinary

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YelpCamp', // make a new folder Yelpcamp on cloudinary
        allowedFormats: ['jpeg', 'jpg']
    },
});

module.exports = {
    cloudinary,
    storage
}