const CustomError = require("./custom-error");

const asyncErrorHandler = (func /*, code*/) => {
    return (req, res, next) => {  
        func(req, res, next).catch((err) => {
            // const error = new CustomError(err.message, code)
            next(err)
        })
    }
}

module.exports = asyncErrorHandler;