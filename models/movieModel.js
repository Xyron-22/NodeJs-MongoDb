const mongoose = require("mongoose");
const fs = require("fs");
const validator = require("validator");

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required field"],
        unique: true,
        maxLength: [100, "Movie name must not be more than 100 characters"],
        minLength: [4, "Movie name must have at least 4 characters"],
        trim: true,
        // validate: {
        //     validator: function (value) {
        //         return validator.isAlpha(value)
        //     },
        //     message: "Value should only contain alphabet"
        // }
    },
    description: {
        type: String,
        required: [true, "Description is required field"],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, "Duration is required field"]
    },
    ratings: {
        type: Number,
        // min: [1, "Ratings must be 1.0 or greater than"],
        // max: [10, "Ratings must be 10 or less than"],
        validate: {
            validator: function (value) {
                return value >= 1 && value <= 10
            },
            message: props => `${props.value} is not on the range allowed in the ratings field`
        }
    },
    totalRating: {
        type: Number,
    },
    releasedYear: {
        type: Number,
        required: [true, "Released Year is required field"]
    },
    releasedDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true, "Genres is required field"],
        // enum: {
        //     values: ["Action", "Adventure", "Sci-Fi", "Thriller", "Crime", "Drama", "Comedy", "Romance", "Biography"],
        //     message: "This genre does not exist"
        // } 
    },
    directors: {
        type: [String],
        required: [true, "Directors is required field"]
    },
    coverImage: {
        type: String,
        required: [true, "Cover Image is required field"]
    },
    actors: {
        type: [String],
        required: [true, "Actors is required field"]
    },
    price: {
        type: Number,
        required: [true, "Price is required field"]
    },
    createdBy: String
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})


//VIRTUAL FIELDS
movieSchema.virtual("durationInHours").get(function () {
    return this.duration / 60;
})

//DOCUMENT MIDDLEWARES
//PRE HOOK
//EXECUTED BEFORE CREATED IN DATABASE
movieSchema.pre("save", function (next) {
    this.createdBy = "Xyron";
    next();
})

//POST HOOK
movieSchema.post("save", function (doc, next) {
    const content = `A new movie document with name ${doc.name} has been created by ${doc.createdBy}`
    fs.writeFileSync("./log/log.txt", content, {flag: "a"}, (err) => {
        console.log(err)
    })
    next()
})

//QUERY MIDDLEWARES
//QUERY PRE HOOK
movieSchema.pre(/^find/, function (next) {
    this.find({releasedYear: {$lte: 2023}});
    this.startTime = Date.now()
    next();
})

//QUERY POST HOOK
movieSchema.post(/^find/, function (doc, next) {
    this.find({releasedYear: {$lte: 2023}});
    this.endTime = Date.now()

    const content = `Query took ${this.endTime - this.startTime}`
    fs.writeFileSync("./log/log.txt", content, {flag: "a"}, (err) => {
        console.log(err)
    })
    next();
})

//AGGREGRATION MIDDLEWAREs
movieSchema.pre("aggregate", function(next) {
    this.pipeline().unshift({$match: {releasedYear: {$lte: 2023}}});
    next();
})

const Movie = new mongoose.model("Movie", movieSchema);
module.exports = Movie;