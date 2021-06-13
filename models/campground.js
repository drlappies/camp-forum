const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const campgroundSchema = new mongoose.Schema({
    title: String,
    image: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

campgroundSchema.virtual('properties.popUpMarkUp').get(function () {
    return `<strong><div>${this.title}</div></strong><div>${this.description.substring(0, 50)} ... <a href="/campgrounds/${this._id}">More</a></div>`
})

campgroundSchema.post('findOneAndDelete', async function (data) {
    await Review.deleteOne({ //when a camp gets deleted, delete all related reviews
        _id: {
            $in: data.reviews
        }
    })
    await User.findByIdAndUpdate(data.author, { //when a camp gets deleted, remove this camp from user post history
        $pull: {
            posts: {
                $in: data._id
            }
        }
    })
})

module.exports = mongoose.model('Campground', campgroundSchema);