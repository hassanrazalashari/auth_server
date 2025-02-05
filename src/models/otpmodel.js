const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true }, // Email to which OTP is sent
    otp: { type: String, required: true },  // OTP
    createdAt: { type: Date, default: Date.now, expires: 300 } // Expires after 5 minutes
});

module.exports = mongoose.model("OTP", otpSchema);
