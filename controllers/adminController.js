const Admin = require("../models/admin");
const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
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
  jwt.sign(
    { admin },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
    (err, token) => {
      res.json({ token });
    }
  );
});
exports.get_posts = asyncHandler(async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.sendStatus(401);
      } else {
        const allPostForAdmin = await BlogPost.find().exec();
        res.json({ allPostForAdmin });
      }
    });
  } else {
    const allPostForUsers = await BlogPost.find({
      Post_status: "published",
    }).exec();
    res.json({ allPostForUsers });
  }
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
exports.post_update = [
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

    const newPost = new BlogPost({
      Post_title: req.body.Post_title,
      Post_Content: req.body.Post_Content,
      Post_status: req.body.Post_status,
      Post_timeStamp: Date.now(),
      _id: req.params.postId,
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
            await BlogPost.findByIdAndUpdate(req.params.postId, newPost, {});
            res.sendStatus(202);
          }
        }
      });
    } else {
      res.sendStatus(401);
    }
  }),
];
exports.comment_delete = asyncHandler(async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.sendStatus(401);
      } else {
        await Comment.findByIdAndRemove(req.params.commentId);
        res.sendStatus(200);
      }
    });
  } else {
    res.sendStatus(401);
  }
});
exports.post_delete = asyncHandler(async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.sendStatus(401);
      } else {
        await Promise.all([
          BlogPost.findByIdAndRemove(req.params.postId),
          Comment.deleteMany({ Post_reference: req.params.postId }),
        ]);
        await BlogPost.findByIdAndRemove(req.params.postId);
        res.sendStatus(200);
      }
    });
  } else {
    res.sendStatus(401);
  }
});
