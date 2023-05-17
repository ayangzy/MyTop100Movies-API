const CustomError = require('../errors')
const Movie = require('../models/movieModel')
const User = require('../models/userModel')
const fetch = require('node-fetch')
const apiKey = process.env.API_KEY
const baseUrl = process.env.BASE_URL

async function createMovie(movieData, userId) {
  try {
    const movie = await Movie.findOne({
      title: movieData.title,
      createdBy: userId,
    })
    if (movie) {
      throw new CustomError.BadRequestError(
        `You already added the movie titled ${movie.title}`,
      )
    }
    const newMovie = await Movie.create(movieData)

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          movies: {
            movieId: newMovie._id,
            rank: 0,
          },
        },
      },
      { new: true },
    )

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

async function getUserTop100Movies(userId) {
  try {
    const user = await User.findById(userId)

    if (!user) {
      throw new CustomError.NotFoundError('User not found')
    }

    const rankedMovies = user.movies.filter((movie) => movie.rank >= 1)

    if (rankedMovies.length === 0) {
      return []
    }

    const sortedMovies = rankedMovies.sort((a, b) => a.rank - b.rank)

    const topMovies = sortedMovies.slice(0, 100)

    const moviePromises = topMovies.map(async (movie) => {
      const movieId = movie.movieId
      const movieDetails = await Movie.findById(movieId)
      return {
        ranking: movie.rank,
        movie: movieDetails,
      }
    })

    const topMoviesWithDetails = await Promise.all(moviePromises)

    return topMoviesWithDetails
  } catch (error) {
    throw error
  }
}

async function rankMovie(userId, movieId, rank) {
  try {
    const user = await User.findById(userId)

    if (!user) {
      throw new CustomError.NotFoundError('User not found')
    }

    const existingRank = user.movies.find((m) => m.rank === rank)

    if (existingRank) {
      throw new CustomError.BadRequestError(
        'The rank is already assigned to a movie',
      )
    }

    const movieIndex = user.movies.findIndex(
      (m) => m.movieId.toString() === movieId,
    )

    if (movieIndex === -1) {
      throw new CustomError.BadRequestError("Movie not found in user's list")
    }

    user.movies[movieIndex].rank = rank

    await user.save()

    return
  } catch (error) {
    throw error
  }
}

const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
}

async function getMovieList(pageNumber) {
  try {
    const response = await fetch(
      `${baseUrl}/movie/popular?language=en-US&page=${pageNumber}`,
      options,
    )
    const result = await response.json()

    return result
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
  getUserTop100Movies,
  rankMovie,
  getMovieList,
}
