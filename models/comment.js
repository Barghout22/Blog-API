const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  Commentor_name: { type: String, required: true },
  Comment_content: { type: String, required: true },
  Post_reference: { type: Schema.Types.ObjectId, ref: "Post" },

  Comment_Date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSchema);
