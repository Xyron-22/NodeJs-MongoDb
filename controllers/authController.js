const User = require("../models/userModel");
const asyncErrorHandler = require("../utils/async-error-handler");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/custom-error");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

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

    if(testToken && testToken.startsWith("Bearer")) {
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

const restrict = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            const error = new CustomError("You do not have the permission to perform this action", 403)
            return next(error)
        } else {
            next()
        }
    }
}

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
    //get user by email
    const {email} = req.body;
    const user = await User.findOne({email})
    if (!user) {
        const error = new CustomError("No user found with the given email", 401)
        return next(error)
    }
    //generate random reset token
    const resetToken = user.createResetPasswordtoken();
    await user.save({validateBeforeSave: false})

    //send email to user with link attached with the token
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `We have received a password reset request. Please use the link below to reset your password\n\n${resetUrl}\n\nThis password will only be available for 10 minutes`
    try {
        await sendEmail({
            email: user.email,
            subject: "Password change request received",
            message: message
        });

        res.status(200).json({
            status: "success",
            message: "password reset link sent to the user"
        })
    } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetTokenExpired = undefined

        user.save({validateBeforeSave: false});

        return next(new CustomError("There was an error sending password reset email. Please try again later", 500))
    } 
})

const resetPassword = asyncErrorHandler(async (req, res, next) => {
    //we extract the token attached to the link we sent to the email of the user and hash it
    const token = crypto.createHash("sha256").update(req.params.token).digest("hex")
    //we then find the user in the db with hashed token and we check if the token is still live and active
    const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpired: {$gt: Date.now()}})

    if(!user) {
        const error = new CustomError("Token is invalid or has expired!", 400)
        return next(error)
    }

    //we then set these fields if we find the user
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpired = undefined;
    user.passwordChangedAt = Date.now();

    user.save()
    
    const loginToken = signToken(user._id)

    res.status(201).json({
        status: "success",
        token: loginToken,
    })

})

module.exports = {signup, login, protect, restrict, forgotPassword, resetPassword};