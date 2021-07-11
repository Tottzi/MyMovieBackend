const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  userId: { type : String , unique : true, required : true},
  name: { type : String , unique : true, required : true},
  password: String,
  movies: Array
})

module.exports = Users = mongoose.model('users', userSchema);