const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');
const Users = require('../../users/userSchema');
const fetchURL = process.env.MODE === 'DEV'
  ? 'http://localhost:5000/'
  : 'https://hackday-mymovies-backend.herokuapp.com/'

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
  const user = await Users.findOne({name: userName}).catch(err => console.log(err))
  const movies = await Promise.all(user.movies.map(async movie => {
    const response = await axios.get(`${fetchURL}api/movie/${movie.imdbID}`)
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

router.post('/verify/username', async (req, res) => {
  const userName = req.body.username.toLowerCase();
  const user = await Users.findOne({ name: userName})
  res.json(user)
});

router.post('/newuser', async (req, res) => {
  const userId = Math.random().toString(16).substr(2,10)
  const psw = await bcrypt.hash(req.body.psw, 10)
  const newUser = {
    userId: userId,
    name: req.body.username.toLowerCase(),
    password: psw,
    movies: []
  }
  const newUserMongo = new Users(newUser)
  newUserMongo.save()
  .then(data => res.json(newUser.name))
  .catch(err => console.log('Error', err.message))
})


router.post('/login', async (req, res) => {
  const userName = req.body.userName.toLowerCase();
  const user = await Users.findOne({ name: userName})
  if(user === null){
    return res.json({"message": "The username is not exist"})
  }
  const passCheck = await bcrypt.compare(req.body.userPass, user.password)
  const { movies, userId, name } = user;
  passCheck ? res.json({movies, userId, name}) : res.json({"message": "The password is not correct"})
})

module.exports = router