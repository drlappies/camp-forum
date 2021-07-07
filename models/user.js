const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    about: {
        type: String,
    },
    icon: {
        url: {
            type: String,
            default: 'https://res.cloudinary.com/davxrgxza/image/upload/v1625464394/YelpCamp/default-profile-pic-e1513291410505_xmic5z.jpg'
        },
        filename: {
            type: String
        }
    }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);