const fs = require('fs');
const path = require('path');

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
  db.comments.push(body.comments[0])
  return db
}

const deleteComment = (imdbID, comment) => {
  const fileName = `${imdbID.toLowerCase()}.json`
  fs.readFile(path.join(__dirname, '../db/movies', `${fileName}`), (err, data) => {
    if(err){
      return console.log(err)
    }
    const db = JSON.parse(data.toString())
    const commentIndex = db.comments.findIndex(rat => rat.ID === comment)
    db.comments.splice(commentIndex, 1)
    fs.writeFileSync(path.join(__dirname, '../db/movies', `${fileName}`), JSON.stringify(db, 0, 1))
  })
}

module.exports = {
  movieRatings,
  addComments,
  deleteComment
}