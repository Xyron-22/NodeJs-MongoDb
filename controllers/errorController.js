const CustomError = require("../utils/custom-error");

//DEV ERRORS/PROGRAM ERRORS
const devErrors = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stackTrace: error.stack,
        error: error
    })
}

//OPERATIONAL ERRORS/PROD ERRORS
const castErrorHandler = (err) => {
    const msg = `invalid value for ${err.path} : ${err.value}`
    return new CustomError(msg, 400) 
}

const duplicateKeyErrorHandler = (err) => {
    const msg = `There is already a movie with name ${err.keyValue.name}`;
    return new CustomError(msg, 400)
}

const validationErrorHandler = (err) => {
    const error = Object.values(err.errors).map((value) => value.message)
    const errorMessages = error.join(". ")
    const msg = `Invalid input data: ${errorMessages}`;
    return new CustomError(msg, 400)
}

const prodErrors = (res, error) => {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        })
    } else {
        res.status(500).json({
            status: "error",
            message: "Something went wrong please try again later"
        })
    }
}

const globalErrorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error"

    if(process.env.NODE_ENV === "development") {
        devErrors(res, error);
    } else if (process.env.NODE_ENV === "production") {
        // console.log(error)
        if (error.name === "CastError") {
            error = castErrorHandler(error)
            // console.log(err)
        } else if (error.code === 11000) {
            error = duplicateKeyErrorHandler(error)
        } else if (error.name === "ValidationError") {
            error = validationErrorHandler(error)
        }
        prodErrors(res, error);
    }
    
}

module.exports = {globalErrorHandler}