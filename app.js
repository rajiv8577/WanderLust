const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/WanderLust";
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js")
const {listingSchema, reviewSchema} = require("./views/schema.js")
const Review = require("./models/reviews.js")

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

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((err) => err.message).join(",");
        throw new ExpressError(400, errMsg)
    }
    else{
        next();
    }
}

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((err) => err.message).join(",");
        throw new ExpressError(400, errMsg)
    }
    else{
        next();
    }
}

app.get("/", (req, res) => {
    res.send("This is root");
})

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}))

// New Route
app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs");
})

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("review");
    res.render("./listings/show.ejs", { listing });
}))

// Post route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    // let {title, desc, img, price, location, country} = req.body;
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing")
    // }
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
}))

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
}))

// Update route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing")
    // } 
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    console.log(req.body);
    res.redirect(`/listings/${id}`);
}))

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))


// Review
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review)
    let {id} = req.params;

    listing.review.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("Comment saved!")
    res.redirect(`/listings/${id}`)
}))

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {review: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))


// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "New Villa",
//         description: "To the Beach",
//         price: 1200,
//         location: "Goa",
//         country: "india"
//     })

//     await sampleListing.save();
//     console.log("Data saved!");
//     res.send("Data is saved.");
// })

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