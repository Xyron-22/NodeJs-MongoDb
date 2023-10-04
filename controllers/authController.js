const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/async-error-handler");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcryptjs");
const util = require("util");

const signToken = (id) => {
    return jwt.sign({id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

const signup = asyncErrorHandler(async (req, res, next) => {
    
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id)

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    })
})

const login = asyncErrorHandler( async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) {
        const error = new CustomError("Please Provide email ID and password for logging in", 400)
        return next(error);
    }
    const user = await User.findOne({email}).select("+password")
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        const error = new CustomError("Incorrect email or password", 400)
        return next(error);
    }

    const token = signToken(user._id)

    res.status(200).json({
        status: "success",
        token,
        user
    })
})

const protect = asyncErrorHandler(async (req, res, next) => {
    //read the token and check if it exist
    const testToken = req.headers.authorization;
    let token;

    if(testToken && testToken.startsWith("bearer")) {
        token = testToken.split(" ")[1];
    }
    if(!token) {
        return next(new CustomError("You are not logged in", 401))
    }

    //validate the token
    const decodedToken = await jwt.verify(token, process.env.SECRET_STR)

    //if user exist
    const user = await User.findById(decodedToken.id)
    if (!user) {
        const error = new CustomError("No user found", 401)
        return next(error)
    }

    //if the user changed the password after issuance of token, we prohibit the user go through this middleware and access this route, he would have to log in again with the new password to issue him with new token
    if (await user.isPasswordChanged(decodedToken.iat)) {
        const error = new CustomError("The password has been changed recently. Please log in again", 401)
        return next (error)
    }

    //allow user to access
    req.user = user;
    next()
})

module.exports = {signup, login, protect};