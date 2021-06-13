const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(), //basic Joi functions e.g joi.number(), in this case joi.string()
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!' //error message if violated
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, { //clean will be empty string if value violated the rule
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value }) // clean is emply, not equal to original value passed in, return error essage.
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension) //add custom extension function to Joi 

module.exports.campgroundSchema = Joi.object({
    title: Joi.string().required().escapeHTML(),
    location: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    description: Joi.string().required().escapeHTML(),
    deleteImages: Joi.array()
}).required()

module.exports.reviewSchema = Joi.object({
    body: Joi.string().required().escapeHTML(),
    rating: Joi.number().required().min(1).max(5)
}).required()