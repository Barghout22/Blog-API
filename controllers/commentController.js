const asyncHandler = require("express-async-handler");
const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");

exports.get_comments = asyncHandler(async (req, res, next) => {
  const [post, commentsOnPost] = await Promise.all([
    BlogPost.findById(req.params.postId).exec(),
    Comment.find({ Post_reference: req.params.postId }).exec(),
  ]);
  if (post === null) {
    res.sendStatus(404);
  }
  res.json({ post, commentsOnPost });
});
exports.add_comment = [
  body("Commentor_name", "post title cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("Comment_content", "post body cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("Post_reference").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    const requestedPost = await BlogPost.findById(req.params.postId).exec();
    const comment = new Comment({
      Commentor_name: req.body.Commentor_name,
      Comment_content: req.body.Comment_content,
      Post_reference: requestedPost,
    });
    if (!errors.isEmpty()) {
      res.json({
        status: "error",
        code: 400,
        message: "invalid data",
        errors: errors,
      });
    } else {
      await comment.save();
      //   console.log(req.params.postId);
      res.sendStatus(201);
    }
  }),
];
