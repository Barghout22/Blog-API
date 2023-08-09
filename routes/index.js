const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json("welcome to the api");
});
router.get("/login", adminController.admin_index);
router.post("/login", adminController.admin_login);
router.post("/posts", adminController.post_creation);

module.exports = router;
