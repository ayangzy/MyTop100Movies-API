const CustomError = require('../errors')
const Movie = require('../models/movieModel')
const User = require('../models/userModel')

async function createMovie(movieData, userId, rank) {
  try {
    const movie = await Movie.findOne({ title: movieData.title })
    if (movie) {
      throw new CustomError.BadRequestError(
        `The movie ${movie.title} is already added`,
      )
    }
    const newMovie = await Movie.create(movieData)

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          movies: {
            movieId: newMovie._id,
            rank: rank,
          },
        },
      },
      { new: true },
    )

    if (!user) {
      throw new CustomError.NotFoundError('User not found')
    }

    const voteCount = await User.aggregate([
      { $match: { 'movies.movieId': newMovie._id } },
      { $project: { voteCount: { $size: '$movies' } } },
    ])

    if (voteCount.length > 0) {
      newMovie.voteCount = voteCount[0].voteCount
      await newMovie.save()
    }

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

    const sortedMovies = user.movies.sort((a, b) => a.rank - b.rank)

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

module.exports = {
  createMovie,
  getAllMovies,
  getMovie,
  updateMovie,
  deleteMovie,
  getUserTop100Movies,
}
