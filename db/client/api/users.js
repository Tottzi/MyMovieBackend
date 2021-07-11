const express = require('express');
const axios = require('axios');
const Users = require('../../users/userSchema');
const fetchURL = process.env.MODE === 'DEV'
  ? 'http://localhost:5000'
  : 'https://hackday-mymovies-backend.herokuapp.com'

const router = express.Router();

router.delete('/mymovies', async (req, res) => {
  const userName = req.body.name.toLowerCase();
  const movie = await Users.findOne({name: userName})
  const movieIndex = movie.movies.findIndex(movie => movie.imdbID === req.body.imdbID)
  movie.movies.splice(movieIndex,1)
  await movie.save()
})

router.get('/mymovies/:name', async (req, res) => {
  const userName = req.params.name.toLowerCase();
  const user = await Users.findOne({name: userName})
  const movies = await Promise.all(user.movies.map(async movie => {
    const response = await axios.get(`${fetchURL}/api/movie/${movie.imdbID}`)
    return response.data
  }))
  res.json(movies)
})



router.get('/:id', async (req, res) => {
  const userName = req.params.id.toLowerCase()
  const user = await Users.findOne({name: userName})
  if(user === null){
    const userId = Math.random().toString(16).substr(2,10)
    const newUser = new Users({
      userId: userId,
      name: userName,
      movies: []
    })
    newUser.save()
    .then(data => res.json(data))
    .catch(err => console.log('Error', err.message))
  } else {
    res.json(user)
  }

})



router.post('/', (req, res) => {
  res.send(req.body)
})

module.exports = router