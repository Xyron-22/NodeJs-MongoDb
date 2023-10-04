const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Movie = require("../models/movieModel");

dotenv.config({path: "./config.env"})

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    // console.log(conn)
    console.log("Connected to Database")
}).catch((error) => {
    console.log("Some error has occured")
})

const movies = JSON.parse(fs.readFileSync("./data/movies.json", "utf-8"));

const deleteMovies = async () => {
    try {
        await Movie.deleteMany()
        console.log("success")
    } catch (error) {
        console.log(error.message)
    }
    process.exit()
}

const importMovies = async () => {
    try {
        await Movie.create(movies)
        console.log("success")
    } catch (error) {
        console.log(error.message)
    }
    process.exit()
}

console.log(process.argv)

if (process.argv[2] === "--import") {
    importMovies()
}
if (process.argv[2] === "--delete") {
    deleteMovies()
}