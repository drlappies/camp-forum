const { campgroundSchema, reviewSchema } = require('../schemas'); //joi shcema
const ExpressError = require('../utils/ExpressError');

module.exports = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(data => data.message).join(',');
        throw new ExpressError(errMsg, 400);
    } else {
        next();
    }
}