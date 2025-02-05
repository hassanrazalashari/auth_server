const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 587,
    auth: {
        user: "pkhassanraza9@gmail.com",
        pass: "kejp dyuj fmvr ndkn",
    }
});
module.exports = transporter;
