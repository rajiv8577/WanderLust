const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js")

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1460627390041-532a28402358?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhY2glMjBzdW5zZXR8ZW58MHx8MHx8fDA%3D",
            set: (v) =>
                v === ""
                    ? "https://images.unsplash.com/photo-1460627390041-532a28402358?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhY2glMjBzdW5zZXR8ZW58MHx8MHx8fDA%3D"
                    : v
        },
    },
    price: Number,
    location: String,
    country: String,
    review: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id: {$in: listing.review}})
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;