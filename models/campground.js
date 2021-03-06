const mongoose = require('mongoose');

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
    reviewCount: {
        type: Number,
        default: 0
    },
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    likeCount: {
        type: Number,
        default: 0
    },
    dislike: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    dislikeCount: {
        type: Number,
        default: 0
    },
    tag: [
        {
            type: String,
        }
    ]
}, { toJSON: { virtuals: true }, timestamps: true });

campgroundSchema.index({ title: "text", description: "text", location: "text", tag: "text" })

campgroundSchema.virtual('properties.popUpMarkUp').get(function () {
    return `<strong><div>${this.title}</div></strong><div>${this.description.substring(0, 50)} ... <a href="/campgrounds/${this._id}">More</a></div>`
})

campgroundSchema.virtual('')

module.exports = mongoose.model('Campground', campgroundSchema);