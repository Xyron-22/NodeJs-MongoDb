const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});

process.on("uncaughtException", (error) => {
    console.log(error.name, error.message);
    console.log("uncaught exception occur, shutting down...")
    process.exit(1);
})

const app = require("./app");

// console.log(app.get("env"))
console.log(process.env.NODE_ENV)
mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    // console.log(conn)
    console.log("Connected to Database")
})


// const testMovie = new Movie({
//     name: "Interstellar",
//     description: "A thrilling sci-fi movie with space adventure and great action",
//     duration: 180,
// })

// testMovie.save()
// .then((doc) =>  console.log(doc))
// .catch((error) => console.log(error))

const server = app.listen(process.env.PORT, "127.0.0.1", () => {
    console.log("server started...")
})

//GLOBAL HANDLING OF REJECTED PROMISE OUTSIDE THE EXPRESS APP, THIS KIND OF ERROR IS FROM THE NODE ITSELF
//UNHANDLED REJECTION
process.on("unhandledRejection", (error) => {
    console.log(error.name, error.message);
    console.log("unhandled rejection occured, shutting down...")
    server.close(() => {
        process.exit(1);
    });
})




