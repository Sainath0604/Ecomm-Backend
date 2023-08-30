require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");

app.use(express.json());
app.use(cors());

const mongoose = require("mongoose");

//MongoDB connection
const isProduction = process.env.NODE_ENV === "production";
const mongoUrl = isProduction
  ? process.env.DATABASE_URL
  : "mongodb://0.0.0.0:27017/";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to Database");
  })
  .catch((e) => console.log(e));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
// ^^Parsing of URL-encoded form data in routes and access the form data via req.body
// ^^set to false, it uses the built-in Node.js querystring library to parse the data

const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);
const productRoutes = require("./routes/productRoutes");
app.use("/", productRoutes);

//Declaring port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
