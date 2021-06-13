const mongoose = require('mongoose');
const User = require('./user');

const reviewSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campground'
    },
    body: String,
    rating: Number,
});

reviewSchema.post('findOneAndDelete', async function (data) { // when a review gets deleted, remove the review from user review history
    await User.findByIdAndUpdate(data.author, {
        $pull: {
            reviews: {
                $in: data._id
            }
        }
    })
})

module.exports = mongoose.model('Review', reviewSchema);