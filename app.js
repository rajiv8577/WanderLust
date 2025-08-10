const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/WanderLust";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js")
const reviews = require("./routes/review.js")

main()
    .then(req => {
        console.log("Connected to Database");
    })
    .catch(err => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.send("This is root");
})

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews)


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!!"));
})

app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong!" } = err;
    // res.status(status).send(message);
    res.status(status).render("error.ejs", {err})
})

app.listen(8080, () => {
    console.log("App is listening on port 8080");
})