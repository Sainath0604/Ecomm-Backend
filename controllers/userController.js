const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_secret = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

require("../models/userModel");
const User = mongoose.model("userInfo");

const userController = {
  register: async (req, res) => {
    const { fName, lName, email, password, userType } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);

    try {
      const oldUser = await User.findOne({ email });

      if (oldUser) {
        return res.json({ error: "User already exits" });
      }

      await User.create({
        fName,
        lName,
        email,
        password: encryptedPassword,
        userType,
      });
      res.send({ status: "ok" });
    } catch (error) {
      res.send({ status: "error" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        error: "User does not exits, please register if you haven't",
      });
    }
    if (await bcrypt.compare(password, user.password)) {
      //creates token with secret
      const token = jwt.sign({ email: user.email }, JWT_secret);

      if (res.status(201)) {
        return res.json({ status: "ok", data: token, userType: user.userType });
      } else {
        return res.json({ status: "error" });
      }
    }
    res.json({ status: "error", error: "Invalid Credentials" });
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const oldUser = await User.findOne({ email });
      if (!oldUser) {
        return res.json({ status: "User does not exists" });
      } else {
        res.json({
          status:
            "A link has been sent to your email, link will be activated for 5 minutes only",
        });
      }

      const secret = JWT_secret + oldUser.password;
      //^^made secret with JWT_SECRET and password
      const token = jwt.sign(
        { email: oldUser.email, id: oldUser._id },
        secret,
        {
          expiresIn: "5m",
        }
      );
      //^^created token with email, id and above secret which expires in 5min

      const resetPassUrl = isProduction
        ? process.env.BACKEND_URL
        : "http://localhost:5000";

      const link = `${resetPassUrl}/resetPassword/${oldUser._id}/${token}`;
      console.log(link);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      });

      const mailOptions = {
        from: "youremail@gmail.com",
        to: email,
        subject: "Password reset ",
        text: link,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    } catch (error) {
      console.log(error);
    }
  },

  resetPasswordGet: async (req, res) => {
    const { id, token } = req.params;
    console.log(req.params);
    //verfy id
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
      return res.json({ status: "User does not exists" });
    }
    const secret = JWT_secret + oldUser.password;
    try {
      const verify = jwt.verify(token, secret);
      res.render("index", { email: verify.email, status: "verified" });
    } catch (error) {
      res.send("Not verified");
      console.log(error);
    }
  },

  resetPasswordPost: async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    //verfy id
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
      return res.json({ status: "User does not exists" });
    }
    const secret = JWT_secret + oldUser.password;
    try {
      const verify = jwt.verify(token, secret);
      const encryptedPassword = await bcrypt.hash(password, 10);
      await User.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            password: encryptedPassword,
          },
        }
      );

      res.render("index", {
        email: verify.email,
        status: "verifiedWithUpdatedPass",
      });
    } catch (error) {
      res.json({ status: "Something went wrong" });
      console.log(error);
    }
  },

  userData: async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_secret);
      const userEmail = user.email;

      User.findOne({ email: userEmail })
        .then((data) => {
          res.send({ staus: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {
      res.send({ satus: "error" });
    }
  },

  getAllUser: async (req, res) => {
    try {
      const allUser = await User.find({});
      res.send({ status: "ok", data: allUser });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", message: "Failed to get users" });
    }
  },

  deleteUser: async (req, res) => {
    const { userid } = req.body;
    try {
      await User.deleteOne({ _id: userid }),
        function (err, res) {
          console.log(err);
        };
      res.send({ status: "ok", data: "User deleted from database" });
    } catch (error) {
      console.log(error);
    }
  },

  editUser: async (req, res) => {
    const { userid, newfName, newlName, newEmail } = req.body;
    try {
      await User.updateOne(
        { _id: userid },
        { fName: newfName, lName: newlName, email: newEmail }
      );
      res.send({ status: "ok", data: "User information updated" });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: "error",
        message: "Failed to update user information",
      });
    }
  },
};

module.exports = userController;
