const movieService = require('../services/movieService')
const {
  createdResponse,
  successResponse,
} = require('../responses/apiResponses')

exports.createMovie = async (req, res) => {
  const { userId } = req.user
  req.body.createdBy = userId

  const newMovie = await movieService.createMovie(req.body, userId)
  createdResponse(res, 'Movie created successfully', newMovie)
}

exports.getAllMovies = async (req, res) => {
  const user = req.user.userId
  const movies = await movieService.getAllMovies(user)
  successResponse(res, 'Movies retrieved successfully', movies)
}

exports.getMovie = async (req, res) => {
  const user = req.user.userId
  const movie = await movieService.getMovie(req.params.id, user)
  successResponse(res, 'Movie retrieved successfully', movie)
}

exports.updateMovie = async (req, res) => {
  const user = req.user.userId
  const updatedMovie = await movieService.updateMovie(
    req.params.id,
    req.body,
    user,
  )
  successResponse(res, 'Movie updated successfully', updatedMovie)
}

exports.deleteMovie = async (req, res) => {
  const user = req.user.userId
  await movieService.deleteMovie(req.params.id, user)
  successResponse(res, 'Movie deleted successfully')
}

exports.getTop100Movies = async (req, res) => {
  const user = req.user.userId
  const topMovies = await movieService.getUserTop100Movies(user)
  successResponse(res, 'Top movies retreived successfully', topMovies)
}

exports.rankMovie = async (req, res) => {
  const user = req.user.userId
  const { movieId } = req.params
  const { rank } = req.body

  await movieService.rankMovie(user, movieId, rank)

  successResponse(res, 'Movie ranked successfully')
}

exports.getExternalApiMovies = async (req, res) => {
  const { page } = req.query
  const data = await movieService.getMovieList(page)
  successResponse(res, 'Popular movies retreived successfully', data)
}
