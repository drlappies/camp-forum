const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campground'
    },
    body: {
        type: String,
    },
    rating: {
        type: Number
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }
}, { timestamps: true });

reviewSchema.post('findOneAndDelete', async function (data) {
    await User.findByIdAndUpdate(data.author, {
        $pull: {
            reviews: {
                $in: data._id
            }
        }
    })
})

module.exports = mongoose.model('Review', reviewSchema);