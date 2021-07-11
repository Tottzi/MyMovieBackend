const Movies = require('../movies/movieSchema')
const Users = require('../users/userSchema')

// New functions for mongoDB
const checkRatings = (movie, name) => {
  return movie.ratings.findIndex(rating => rating.authorName === name)
}

const addOrUpdateReview = async (movie, body, params) => {
  if(params === 'rating'){
    const authorName = body.ratings[0].authorName;
    const rating = body.ratings[0].rating;
    const imdbID = body.imdbID;
    const index = checkRatings(movie, body.ratings[0].authorName);
    if(index > -1){
      return Movies.updateOne({imdbID : imdbID, "ratings.authorName": authorName},{
        $set: {"ratings.$.rating": rating}
      }, (err, data) => console.log(data.nModified))
    }
    return Movies.findOneAndUpdate({imdbID: body.imdbID}, {
      $push: { ratings: body.ratings[0] }
    },
      { new: true }, (err, data) => console.log(data.nModified)
      )
  } else if(params === 'comment'){
    Movies.findOneAndUpdate({imdbID: body.imdbID}, {
      $push: { comments: body.comments[0] }
    },
      { new: true }, (err, data) => console.log(data)
      )
  }
}

const addOrUpdateUser = async (body, params) => {
  let userName = ''
  if(params === 'rating') userName = body.ratings[0].authorName.toLowerCase()
  if(params === 'comment') userName = body.comments[0].authorName.toLowerCase()
  const userMovies = await Users.findOne({name: userName}).then(doc => doc.movies)
  const movieIndex = userMovies.findIndex(movie => movie.imdbID === body.imdbID)
  if(movieIndex === -1){
    const rating = body.ratings ? body.ratings[0].rating : 0
    const newMovie = {
      imdbID: body.imdbID,
      ratings: rating
    }
    Users.updateOne({name: userName},{
      $push: { movies:  newMovie}
    }, { new: true }, (err, data) => console.log(data.nModified)
    )
  } else {
    const rating = body.ratings ? body.ratings[0].rating : 0
    Users.updateOne({name : userName, "movies.imdbID": body.imdbID},{
      $set: {"movies.$.ratings": rating}
    }, (err, data) => console.log(data.nModified))
  }
}

const deleteComment = async (imdbID, commentId) => {
  console.log(imdbID)
  const movie = await Movies.findOne({imdbID: imdbID})
  const commentIndex = movie.comments.findIndex(comment => comment.id === commentId)
  movie.comments.splice(commentIndex,1);
  movie.save()
}

const updateComment = async (imdbID, comment) => {
  console.log(imdbID, comment)
  const movie = await Movies.updateOne({imdbID: imdbID, "comments.id": comment.id},{
  $set: {"comments.$": comment}},(err, data) => console.log(data)
  
  )
}

// Old functions for fs components
const movieRatings = (body, db) => {
  if(!db.ratings){
    db.ratings = []
  }
  const ratingIndex = db.ratings.findIndex(rat => rat.author === body.ratings[0].author)
  if(ratingIndex >= 0){
    db.ratings[ratingIndex] = body.ratings[0]
    return db
  }
  db.ratings.push(body.ratings[0])
  return db
}

const addComments = (body, db) => {
  if(!db.comments){
    db.comments = []
  }
  db.comments.unshift(body.comments[0])
  return db
}

const addMovieUser = (body, db) => {
  const {ratings, imdbID} = body
  const movieIndex = db.movies.findIndex(movie => movie.imdbID === imdbID)
  const rat = ratings ? ratings[0].rating : 0
  if(movieIndex !== -1){
    db.movies[movieIndex] = {imdbID, ratings: rat}
    console.log(movieIndex)
    return db
  } else {
  db.movies.push({imdbID, ratings: rat})
  return db
  }
}



module.exports = {
  movieRatings,
  addComments,
  deleteComment,
  addMovieUser,
  updateComment,
  addOrUpdateReview,
  addOrUpdateUser
}