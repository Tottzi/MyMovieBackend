const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  id: { type : String , unique : true, required : true},
  authorId: String,
  authorName: String,
  text: String,
  timeStamp: String,
  changed:String
})

module.exports = Comments = mongoose.model('comments', commentSchema);