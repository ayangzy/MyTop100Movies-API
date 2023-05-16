const CustomError = require('../errors')
const Movie = require('../models/movieModel')

async function createMovie(movieData) {
  try {
    const movie = await Movie.findOne({ title: movieData.title })
    if (movie) {
      throw new CustomError.BadRequestError(
        `The movie ${movie.title} is already added`,
      )
    }
    const newMovie = await Movie.create(movieData)
    return newMovie
  } catch (error) {
    throw error
  }
}

async function getAllMovies(user) {
  try {
    const movies = await Movie.find({ createdBy: user })
    return movies
  } catch (error) {
    throw error
  }
}

async function getMovie(id, user) {
  try {
    const movie = await Movie.findOne({ _id: id })
    if (!movie) {
      throw new CustomError.NotFoundError('Movie not found')
    }
    if (movie.createdBy != user) {
      throw new CustomError.UnauthorizedError(
        'You are not authorized to view this movie',
      )
    }
    return movie
  } catch (error) {
    throw error
  }
}

async function updateMovie(id, movieData, user) {
  try {
    const movie = await Movie.findOne({ _id: id })
    if (!movie) {
      throw new CustomError.NotFoundError('Movie not found')
    }
    if (movie.createdBy != user) {
      throw new CustomError.UnauthorizedError(
        'You are not authorized to update this movie',
      )
    }
    const updatedMovie = await Movie.findOneAndUpdate({ _id: id }, movieData, {
      new: true,
      runValidators: true,
    })
    return updatedMovie
  } catch (error) {
    throw error
  }
}

async function deleteMovie(id, user) {
  try {
    const movie = await Movie.findOne({ _id: id })
    if (!movie) {
      throw new CustomError.NotFoundError('Movie not found')
    }
    if (movie.createdBy != user) {
      throw new CustomError.UnauthorizedError(
        'You are not authorized to delete this movie',
      )
    }
    await Movie.findOneAndDelete({ _id: id })
  } catch (error) {
    throw error
  }
}

module.exports = {
  createMovie,
  getAllMovies,
  getMovie,
  updateMovie,
  deleteMovie,
}
