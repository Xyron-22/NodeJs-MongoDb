const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/async-error-handler");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcryptjs");

const signup = asyncErrorHandler(async (req, res, next) => {
    
    const newUser = await User.create(req.body);

    const token = jwt.sign({id: newUser._id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })

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

    if (!user) {
        const error = new CustomError("No user found", 400)
        return next(error);
    }

    const result = await bcrypt.compare(password, user.password)
    if (result) {
        const token = jwt.sign({id: user._id}, process.env.SECRET_STR, {
            expiresIn: process.env.LOGIN_EXPIRES
        })
        res.status(200).json({
            status: "success",
            token,
        })
    } else {
        const error = new CustomError("Incorrect Password", 400)
        next(error)
    }
})

module.exports = {signup, login};