const mongoose = require("mongoose");

require("../models/productModel");
const Product = mongoose.model("product");

const productController = {
  uploadProduct: async (req, res) => {
    try {
      const { pName, pDescription, Price } = req.body;
      const { buffer, mimetype } = req.file;

      const newProduct = new Product({
        pName,
        pDescription,
        Price,
        image: {
          data: buffer.toString("base64"),
          contentType: mimetype,
        },
      });

      await newProduct.save();

      res.send({ status: "ok", data: "Product uploaded successfully." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ status: "error", message: "Failed to upload Product." });
    }
  },

  getProductInfo: async (req, res) => {
    try {
      const products = await Product.find();

      const processedProduct = products.map((product) => ({
        _id: product._id,
        pName: product.pName,
        pDescription: product.pDescription,
        Price: product.Price,
        image: {
          contentType: product.image.contentType,
          data: `data:${product.image.contentType};base64,${product.image.data}`,
        },
      }));

      res.json(processedProduct);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: "error",
        message: "Failed to retrieve product information.",
      });
    }
  },

  deleteProductInfo: async (req, res) => {
    const { productId } = req.body;
    try {
      await Product.deleteOne({ _id: productId }),
        function (err, res) {
          console.log(err);
        };
      res.send({ status: "ok", data: "Product Info deleted" });
    } catch (error) {
      console.log(error);
      res.send({ status: "error", data: "Failed to delete product Info" });
    }
  },

  editProductInfo: async (req, res) => {
    const { productId, pName, pDescription, Price } = req.body;

    if (!productId) {
      return res
        .status(400)
        .send({ status: "error", message: "Invalid productId." });
    }

    try {
      let updateFields = { pName, pDescription, Price };

      if (req.file) {
        const { buffer, mimetype } = req.file;
        updateFields.image = {
          data: buffer.toString("base64"),
          contentType: mimetype,
        };
      }

      const updateQuery = updateFields.image
        ? { $set: updateFields }
        : updateFields;
      await Product.updateOne({ _id: productId }, updateQuery);
      res.send({ status: "ok", data: "Product Info updated" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({ status: "error", message: "Failed to update Product Info" });
    }
  },
};

module.exports = productController;
