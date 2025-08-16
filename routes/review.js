const express = require("express")
const router = express.Router({mergeParams: true});
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js")
const {reviewSchema} = require("../views/schema.js")
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js")

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

// Review
router.post("/", validateReview, wrapAsync(async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review)
    let {id} = req.params;

    listing.review.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "Review added successfully!")

    console.log("Comment saved!")
    res.redirect(`/listings/${id}`)
}))

// Delete Review Route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {review: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!")

    res.redirect(`/listings/${id}`);
}))

module.exports = router;