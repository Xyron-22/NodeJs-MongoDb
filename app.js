const express = require("express");
const morgan = require("morgan");
const CustomError = require("./utils/custom-error");
const {globalErrorHandler} = require("./controllers/errorController");

const moviesRouter = require("./routes/moviesRoutes");
const authRouter = require("./routes/authRouter");

const app = express();

// const logger = (req, res, next) => {
//     console.log("Custom middleware called")
//     next();
// }


app.use(express.json());

app.use(express.static("./public"))

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// app.use(logger)

app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next()
})

// GET api/movies

// app.get("/api/v1/movies", getAllMovies)

// app.get("/api/v1/movies/:id", getMovie)

// app.post("/api/v1/movies", createMovie)

// app.patch("/api/v1/movies/:id", updateMovie)

// app.delete("/api/v1/movies/:id", deleteMovie)

app.use("/api/v1/movies", moviesRouter)
app.use("/api/v1/users", authRouter)

app.all("*", (req, res, next) => {
    // res.status(404).json({
    //     status: "failed",
    //     message: `Route ${req.originalUrl} requested does not exist`
    // })
    // const err = new Error(`Route ${req.originalUrl} requested does not exist`);
    // err.status = "fail";
    // err.statusCode = 404;
    const err = new CustomError(`Route ${req.originalUrl} requested does not exist`, 404);

    next(err);
})

app.use(globalErrorHandler)

module.exports = app;