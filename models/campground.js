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
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    dislike: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    tag: [
        {
            type: Object,
            enum: [
                { tagName: 'Glamping', tagColor: '#B2B2B2' },
                { tagName: 'Toilet', tagColor: '#3F7FBF' },
                { tagName: 'Drying Rack', tagColor: '#A3F4F4' },
                { tagName: 'Table', tagColor: '#B96D21' },
                { tagName: 'Chair', tagColor: '#B96D21' },
                { tagName: 'Water Tap', tagColor: '#B2DBDB' },
                { tagName: 'Shower', tagColor: '#3FBFBF' },
                { tagName: 'Playground', tagColor: '#BF7F3F' },
                { tagName: 'Stream', tagColor: '#3F7FBF' },
                { tagName: 'Starnight', tagColor: '#1C1616' },
                { tagName: 'Beginner', tagColor: '#3FBF3F' },
                { tagName: 'Intermediate', tagColor: '#BFBF3F' },
                { tagName: 'Expert', tagColor: '#BF3F3F' }
            ]
        }
    ],
}, { toJSON: { virtuals: true }, timestamps: true });

campgroundSchema.index({ title: "text", description: "text", location: "text" })

campgroundSchema.virtual('properties.popUpMarkUp').get(function () {
    return `<strong><div>${this.title}</div></strong><div>${this.description.substring(0, 50)} ... <a href="/campgrounds/${this._id}">More</a></div>`
})

campgroundSchema.post('findOneAndDelete', async function (data) {
    await Review.deleteOne({
        _id: {
            $in: data.reviews
        }
    })
})

module.exports = mongoose.model('Campground', campgroundSchema);