module.exports = function (func) {
    return function (req, res, next) {
        func(req, res, next)
            .catch(function (error) {
                next(error);
            })
    }
}