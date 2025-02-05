const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const URI = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;