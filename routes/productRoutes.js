const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require("multer");
const upload = multer();

router.post(
  "/uploadProduct",
  upload.single("product"),
  productController.uploadProduct
);
router.get("/getProductInfo", productController.getProductInfo);
router.post("/deleteProductInfo", productController.deleteProductInfo);
router.post(
  "/editProductInfo",
  upload.single("product"),
  productController.editProductInfo
);

module.exports = router;
