const Admin = require("../models/admin");
const BlogPost = require("../models/blogPost");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

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
  const admin = await Admin.findOne({ username: req.body.username });
  if (!admin) {
    res.status(403).send("incorrect logins");
  }
  const match = bcrypt.compare(req.body.password, admin.password);
  if (!match) {
    res.status(403).send("incorrect password");
  }
  jwt.sign({ admin }, process.env.JWT_SECRET, (err, token) => {
    res.json({ token });
  });
});
exports.post_creation = [
  body("Post_title", "post title cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("Post_Content", "post body cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors.isEmpty);
    const newPost = new BlogPost({
      Post_title: req.body.Post_title,
      Post_Content: req.body.Post_Content,
      Post_status: req.body.Post_status ? req.body.Post_status : "unpublished",
      Post_timeStamp: Date.now(),
    });
    const bearerHeader = req.headers["authorization"];
    if (bearerHeader) {
      const bearer = bearerHeader.split(" ");
      const token = bearer[1];
      jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.sendStatus(401);
        } else {
          if (!errors.isEmpty()) {
            res.json({
              status: "error",
              code: 400,
              message: "invalid data",
              errors: errors,
            });
          } else {
            console.log("heloo")
            await newPost.save();
            res.status(201).send("post created");
          }
        }
      });
    } else {
      res.sendStatus(401);
    }
  }),
];
