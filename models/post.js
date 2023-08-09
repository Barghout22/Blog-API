const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  Post_title: { type: String, required: true },
  Post_Content: { type: String, required: true },
  Post_status: { type: String, enum: ["published", "unpublished"] },
  Post_timeStamp: { type: Date, Default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
