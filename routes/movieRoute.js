const express = require('express')
const router = express.Router()
const movieController = require('../controllers/movieController')
const authenticateUser = require('../middleware/authentication')

router.route('/external-api').get(movieController.getExternalApiMovies)
router.route('/rank/:movieId').post(authenticateUser, movieController.rankMovie)

router
  .route('/topMovies')
  .get(authenticateUser, movieController.getTop100Movies)
router
  .route('/')
  .get(authenticateUser, movieController.getAllMovies)
  .post(authenticateUser, movieController.createMovie)

router
  .route('/:id')
  .get(authenticateUser, movieController.getMovie)
  .patch(authenticateUser, movieController.updateMovie)
  .delete(authenticateUser, movieController.deleteMovie)

module.exports = router
