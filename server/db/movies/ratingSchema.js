const mongoose = require('mongoose');
const { Schema } = mongoose;

const ratingSchema = new Schema({
  authorId: String,
  authorName: String,
  rating: Number
})

module.exports = Ratings = mongoose.model('ratings', ratingSchema);