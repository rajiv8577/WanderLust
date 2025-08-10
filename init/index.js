const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/WanderLust";
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
    .then(res => {
        console.log("Connected to Database.");
    })
    .catch(err => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    console.log("Data deleted.");
    await Listing.insertMany(initData.data);
    console.log("Data inserted!");
}

initDB();