const express = require('express');
const axios = require('axios');
const Movies = require('../../movies/movieSchema')
const Users = require('../../users/userSchema')

const { 
  deleteComment,
  updateComment,
  addOrUpdateReview,
  addOrUpdateUser
} = require('../index')

const router = express.Router();

const addNewMovie = movie => {
  const newMovie = new Movies(
    movie
  )
  newMovie.save()
    .then(data => console.log(data))
    .catch(err => console.log('Error', err.message))
};

router.get('/api/movies/:query', async (req, res) => {
  const search = req.params.query
  const response = await axios.get(`https://www.omdbapi.com/?s=${search}&apikey=d9835cc5`);
  res.json(response.data);
})

router.get('/api/movie/:id', async (req, res) => {
  const id = req.params.id
  const response = await axios.get(`https://www.omdbapi.com/?i=${id}&apikey=d9835cc5`);
  const movie = await Movies.findOne({imdbID: id})
  if(movie === null){
    return res.json(response.data)
  }
  const responseObj = response.data;
  responseObj.localData = movie
  return res.json(responseObj);
})

router.get('/api/movies', async (req, res) => {
  const movies = await readMoviesAll();
  res.json(movies)
})

router.post('/api/movie/:type', async (req, res) => {
  const movie = await Movies.findOne({imdbID: req.body.imdbID})
  if(movie === null){
    addNewMovie(req.body)
  }
  addOrUpdateReview(movie, req.body, req.params.type)
  addOrUpdateUser(req.body, req.params.type)
  res.sendStatus(201)
})

router.delete('/api/movie/comment', (req, res) => {
  const {imdbID, comment} = req.body;
  deleteComment(imdbID, comment)
  res.sendStatus(204)
})

router.put('/api/movie/comment', (req, res) => {
  const {imdbID, comment} = req.body.data
  updateComment(imdbID, comment)
  res.json(req.body)
})

module.exports = router;
