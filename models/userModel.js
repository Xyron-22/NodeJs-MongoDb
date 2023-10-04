const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    }
})

//DOCUMENT MIDDLEWARE
//CHECK IF PASSWORD FIELD IS MODIFIED AND IF SO THEN WE ENCRYPT/HASH IT BEFORE SAVING IT TO THE DB
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    //encrypt password
    this.password = await bcrypt.hash(this.password, 5);
    this.confirmPassword = undefined;
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;