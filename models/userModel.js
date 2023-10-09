const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

//name, email, password, confirmpassword, photo
const userSchema = new mongoose.Schema({    
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter an email."],
        unique: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value)
            },
            message: "Please enter valid Email"
        }
    },
    photo: String,
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minLength: [8, "Password must be at least 8 characters"],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function(value) {
                return value == this.password;
            },
            message: "Password and Confirm Password does not match"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpired: Date
})

//DOCUMENT MIDDLEWARE
//CHECK IF PASSWORD FIELD IS MODIFIED AND IF SO THEN WE ENCRYPT/HASH IT BEFORE SAVING IT TO THE DB
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    //encrypt password
    try {
        this.password = await bcrypt.hash(this.password, 5);
        this.confirmPassword = undefined;
        next();
    } catch (error) {
        console.log(error)
    }
})

//creates a custom method for the model
userSchema.methods.isPasswordChanged = async function (JWTTimestamp) {
    if(this.passwordChangedAt) {
        const pwChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        console.log(pwChangedTimestamp, JWTTimestamp)

        return JWTTimestamp < pwChangedTimestamp;
    }
    return false
}

userSchema.methods.createResetPasswordtoken = function () {
    //create a plain random string to send as token to the email of the user
    const resetToken = crypto.randomBytes(32).toString("hex");
    //hash the generated random string and assign it to the passwordResetToken field of this user's document
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    //set the token's expiration time
    this.passwordResetTokenExpired = Date.now() + 10 * 60 * 1000;

    console.log(resetToken, this.passwordResetToken);
    return resetToken
}

const User = mongoose.model("User", userSchema);

module.exports = User;