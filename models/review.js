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
        type: Number,
        default: 0
    },
    isParent: {
        type: Boolean,
        default: true
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { timestamps: true });

const autoPopulateChildren = function (next) {
    this.populate('children')
        .populate({
            path: 'children',
            populate: 'author'
        })
    next();
}

reviewSchema.pre('find', autoPopulateChildren).pre('find', autoPopulateChildren);

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