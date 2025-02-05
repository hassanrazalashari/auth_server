const express = require("express");
const mongoose = require("mongoose");
const database = require("./db/database");
const dotenv = require("dotenv");
const connectDB = require("./db/database");
const Userroute = require("./src/routes/usersroute");
dotenv.config();
const app = express();

//body parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//connect database
connectDB()

//routes
app.use("/api/users", Userroute);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(process.env.PORT, ()=>{
    console.log(`app is listening on port: ${process.env.PORT}`);
});