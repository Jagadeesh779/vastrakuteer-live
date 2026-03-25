const mongoose = require('mongoose');

const uri = "mongodb://localhost:27017/vastra-kuteer";

console.log("Attempting to connect to MongoDB...");

mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
        console.log("SUCCESS: MongoDB is reachable.");
        process.exit(0);
    })
    .catch((err) => {
        console.log("FAILURE: MongoDB is NOT reachable.");
        // console.error(err);
        process.exit(1);
    });
