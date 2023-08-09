const Admin = require("../models/admin");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.admin_index = asyncHandler(async (req, res, next) => {
  const Admin_instance = await Admin.findOne().exec();
  if (!Admin_instance) {
    bcrypt.hash(process.env.ADMIN_PASSWORD, 10, async (err, hashedPassword) => {
      if (err) {
        next(err);
      } else {
        const admin = new Admin({
          username: process.env.ADMIN_USERNAME,
          password: hashedPassword,
        });
        await admin.save();
        res.json({ message: "admin data called" });
      }
    });
  }
});

exports.admin_login = asyncHandler(async (req, res, next) => {
  const admin = await Admin.find({ username: req.body.username });
  if (!admin) {
    res.sendStatus(403).statusMessage("incorrect login data");
  }
  const match = bcrypt.compare(req.body.password, admin.password);
  if (!match) {
    res.sendStatus(403).statusMessage("incorrect password");
  }
  jwt.sign({ admin }, process.env.JWT_SECRET, (err, token) => {
    res.json({ token });
  });
});
exports.post_creation = asyncHandler(async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        res.json({ message: "forbidden access" });
      } else {
        res.json({ message: "post added", admin: authData });
      }
    });
  } else {
    res.json({ message: "forbidden access" });
  }
});
