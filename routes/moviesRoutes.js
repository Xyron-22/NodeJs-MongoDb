const express = require("express");
const {getAllMovies, createMovie, getMovie, updateMovie, deleteMovie, getHighestRated, getMovieStats, getMovieByGenre} = require("../controllers/moviesController");
const {protect, restrict} = require("../controllers/authController");

const router = express.Router();

//PARAM MIDDLEWARE, MIDDLEwARE FOR CHECKING VALUE OF A DYNAMIC ROUTE PARAMETER
// router.param("id", checkId)

router.route("/highest-rated")
    .get(getHighestRated, getAllMovies)

router.route("/movies-stats")
    .get(getMovieStats)

router.route("/movies-by-genre/:genre")
    .get(getMovieByGenre)

//ROUTE HANDLERS
router.route("/")
    .get(protect, getAllMovies)
    .post(createMovie)

//PARAM MIDDLEWARE APPLIES TO THESE ROUTES
router.route("/:id")
    .get(getMovie)
    .patch(updateMovie)
    .delete(protect, restrict("admin"), deleteMovie)



module.exports = router;