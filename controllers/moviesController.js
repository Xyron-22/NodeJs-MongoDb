const fs = require("fs");
const Movie = require("../models/movieModel");
const Apifeatures = require("../utils/api-features");
const CustomError = require("../utils/custom-error");
const asyncErrorHandler = require("../utils/async-error-handler");

//MIDDLEWARE FOR CHECKING BODY PROPERTIES
// const checkBody = (req, res, next) => {
//    const {name, description, duration} = req.body
//    if (!name || !description || !duration) return res.status(400).send("Fields must be complete")
//    next()
// }

//MDDLEWARES

const getHighestRated = (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratings"

    next()
}

//the asyncErrorHandler is called immediately, passing the arguments and then returning anonymous function containing the passed arguments, 
//converting the async arrow function into function declared function to chain a .catch method to it.
const getAllMovies = asyncErrorHandler (async (req, res, next) => {
    
     const features = new Apifeatures(Movie.find(), req.query)
         .filter()
         .sort()
         .limitFields()
         .paginate()
 
     let movies = await features.query;
 
     res.status(200).json({
         status: "success",
         length: movies.length,
         data: {
             movies
         }
     })
 })


//
const getMovie = asyncErrorHandler(async (req, res, next) => {
    const {id} = req.params;
 
        const movie = await Movie.findById(id)
        res.status(200).json({
            status: "success",
            data: {
                movie
            }
        })
}) 

const createMovie = asyncErrorHandler (async (req, res, next) => {
        const movie = await Movie.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                movie
            }
        })
})

const updateMovie = asyncErrorHandler(async (req, res, next) => {
    const {id} = req.params;
        const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});
        res.status(200).json({
            status: "success",
            data: {
                updatedMovie
            }
        })
}) 

const deleteMovie = asyncErrorHandler(async (req, res, next) => {
    const {id} = req.params;
    await Movie.findByIdAndDelete(id)
    res.status(204).json({
        status: "success"
    })
}) 

const getMovieStats = asyncErrorHandler(async (req, res, next) => {
        const stats = await Movie.aggregate([
            // {$match: {releasedYear: {$lte: 2023}}},
            {$group: {
                _id: "$releasedYear", 
                avgRating: { $avg: "$ratings"},
                avgPrice: { $avg: "$price"},
                minPrice: { $min: "$price"},
                maxPrice: { $max: "$price"},
                totalPrice: { $sum: "$price"},
                movieCount: { $sum: 1}
            }},
            {$sort: { minPrice: 1}},
            // {$match: {maxPrice: {$gte: 60}}},
        ])
        res.status(200).json({
            status: "success",
            count: stats.length,
            data: {
                stats
            }
        })
}) 

const getMovieByGenre = asyncErrorHandler(async (req, res, next) => {
        const {genre} = req.params;
        const movies = await Movie.aggregate([
            {$unwind: "$genres"},
            {$group: {
                _id: "$genres",
                movieCount: {$sum: 1},
                movies: {$push: "$name"},
            }},
            {$addFields: {genre: "$_id"}},
            {$project: {_id: 0}},
            {$sort: {movieCount: -1}},
            // {$limit: 6}
            {$match: {genre: genre}}
        ]);
        res.status(200).json({
            status: "success",
            count: movies.length,
            data: {
                movies
            }
        })
}) 

module.exports = {getAllMovies, getMovie, createMovie, updateMovie, deleteMovie, getHighestRated, getMovieStats, getMovieByGenre}