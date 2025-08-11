const express = require("express")
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js")
const {listingSchema} = require("../views/schema.js")
const Listing = require("../models/listing.js");


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


// Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}))

// New Route
router.get("/new", (req, res) => {
    res.render("./listings/new.ejs");
})

// Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("review");
    res.render("./listings/show.ejs", { listing });
}))

// Post route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    // let {title, desc, img, price, location, country} = req.body;
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing")
    // }
    req.flash("success", "Listing added successfully!")
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
}))

// Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
}))

// Update route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing")
    // } 
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    console.log(req.body);
    res.redirect(`/listings/${id}`);
}))

// Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))

module.exports = router;