const express = require('express')
const router = express.Router()
const movieController = require('../controllers/movieController')
const authenticateUser = require('../middleware/authentication')

router.route('/topMovies').get(authenticateUser, movieController.getTopMovies)
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
