const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    suspect: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    informer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    reason: {
        type: String,
        minLength: 0,
        maxLength: 100,
    },
    description: {
        type: String,
        minLength: 0,
        maxLength: 100,
    },
    object: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        refPath: 'model'
    },
    model: {
        type: String,
        required: true,
        enum: ['Campground', 'Review', 'User']
    },
})

module.exports = mongoose.model('Report', reportSchema);