const mongoose = require('mongoose');
const { Schema } = mongoose;

const movieSchema = new Schema({
  imdbID: { type : String , unique : true, required : true},
  ratings: Array,
  comments: Array
})

module.exports = Movies = mongoose.model('movies', movieSchema);