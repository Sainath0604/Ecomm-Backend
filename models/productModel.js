const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  pName: { type: String, required: true, unique: true },
  pDescription: { type: String, required: true },
  Price: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
});

mongoose.model("product", productSchema);
