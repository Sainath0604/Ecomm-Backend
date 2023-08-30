const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const multer = require("multer");
const upload = multer();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgotPassword", userController.forgotPassword);
router.get("/resetPassword/:id/:token", userController.resetPasswordGet);
router.post("/resetPassword/:id/:token", userController.resetPasswordPost);
router.post("/userData", userController.userData);
router.get("/getAllUser", userController.getAllUser);
router.get("/deleteUser", userController.deleteUser);
router.get("/editUser", userController.editUser);
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
