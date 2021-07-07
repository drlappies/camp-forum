const mongoose = require('mongoose');
const Review = require('./review');

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
    ],
    rating: {
        type: Number,
        default: 0
    },
    facility: [
        {
            type: String,
            enum: ['Glamping', 'Lavatory', 'Dry Toiliet', 'Toilet', 'Drying Rack', 'Table', 'Chair', 'Water Tap', 'Mobile Toilet', 'Shower', 'Playground', 'Stream' ]
        }
    ],
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Experienced']
    }
}, { toJSON: { virtuals: true }, timestamps: true });

campgroundSchema.index({ title: "text", description: "text", location: "text" })

campgroundSchema.virtual('properties.popUpMarkUp').get(function () {
    return `<strong><div>${this.title}</div></strong><div>${this.description.substring(0, 50)} ... <a href="/campgrounds/${this._id}">More</a></div>`
})

campgroundSchema.virtual('ratingAvg').get(function () {
    return Math.floor(this.rating / this.reviews.length)
})

campgroundSchema.post('findOneAndDelete', async function (data) {
    await Review.deleteOne({
        _id: {
            $in: data.reviews
        }
    })
})

module.exports = mongoose.model('Campground', campgroundSchema);