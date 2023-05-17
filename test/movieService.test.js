const {
  createMovie,
  getAllMovies,
  getMovie,
  updateMovie,
  deleteMovie,
  getUserTop100Movies,
  rankMovie,
} = require('../services/movieService')
const Movie = require('../models/movieModel')
const User = require('../models/userModel')
const CustomError = require('../errors')

// Mocking the dependencies
jest.mock('../models/movieModel')
jest.mock('../models/userModel')
jest.mock('../errors')

describe('createMovie', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new movie and update user with the movie', async () => {
    const userId = '123'
    const movieData = {
      title: 'Test Movie',
      createdBy: userId,
    }

    // Mocking the Movie.findOne function
    Movie.findOne.mockResolvedValue(null)

    // Mocking the Movie.create function
    const newMovie = { _id: '456', ...movieData }
    Movie.create.mockResolvedValue(newMovie)

    // Mocking the User.findByIdAndUpdate function
    const updatedUser = {
      _id: userId,
      movies: [
        {
          movieId: newMovie._id,
          rank: 0,
        },
      ],
    }
    User.findByIdAndUpdate.mockResolvedValue(updatedUser)

    const result = await createMovie(movieData, userId)

    // Assertions
    expect(Movie.findOne).toHaveBeenCalledWith({
      title: movieData.title,
      createdBy: userId,
    })
    expect(Movie.create).toHaveBeenCalledWith(movieData)
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
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
    expect(result).toEqual(newMovie)
    expect(CustomError.BadRequestError).not.toHaveBeenCalled()
  })

  it('should throw BadRequestError if movie with the same title already exists', async () => {
    const movieData = {
      title: 'Existing Movie',
    }
    const userId = '123'

    // Mocking the Movie.findOne function
    const existingMovie = { title: movieData.title }
    Movie.findOne.mockResolvedValue(existingMovie)

    const expectedErrorMessage = `You already added the movie titled ${existingMovie.title}`
    CustomError.BadRequestError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(createMovie(movieData, userId)).rejects.toEqual({
      message: expectedErrorMessage,
    })
    expect(Movie.findOne).toHaveBeenCalledWith({
      title: movieData.title,
      createdBy: userId,
    })
    expect(Movie.create).not.toHaveBeenCalled()
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled()
    expect(CustomError.BadRequestError).toHaveBeenCalledWith(
      expectedErrorMessage,
    )
  })

  it('should throw an error if an error occurs during execution', async () => {
    const movieData = {
      title: 'Test Movie',
    }
    const userId = '123'
    const expectedError = new Error(
      'An error occured processing your request, please try again',
    )

    // Mocking the Movie.findOne function
    Movie.findOne.mockRejectedValue(expectedError)

    // Assertions
    await expect(createMovie(movieData, userId)).rejects.toThrow(expectedError)
    expect(Movie.findOne).toHaveBeenCalledWith({
      title: movieData.title,
      createdBy: userId,
    })
    expect(Movie.create).not.toHaveBeenCalled()
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled()
    expect(CustomError.BadRequestError).not.toHaveBeenCalled()
  })
})

describe('getAllMovies', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return all movies created by the user', async () => {
    const user = '123'

    // Mocking the Movie.find function
    const movies = [
      { title: 'Movie 1', createdBy: user },
      { title: 'Movie 2', createdBy: user },
    ]
    Movie.find.mockResolvedValue(movies)

    const result = await getAllMovies(user)

    // Assertions
    expect(Movie.find).toHaveBeenCalledWith({ createdBy: user })
    expect(result).toEqual(movies)
  })

  it('should throw an error if an error occurs during execution', async () => {
    const user = '123'
    const expectedError = new Error(
      'An error occured processing your request, please try again',
    )

    // Mocking the Movie.find function
    Movie.find.mockRejectedValue(expectedError)

    // Assertions
    await expect(getAllMovies(user)).rejects.toThrow(expectedError)
    expect(Movie.find).toHaveBeenCalledWith({ createdBy: user })
  })
})

describe('getMovie', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the movie if it exists and the user is authorized', async () => {
    const movieId = '123'
    const user = 'user123'

    // Mocking the Movie.findOne function
    const movie = { _id: movieId, createdBy: user, title: 'Test Movie' }
    Movie.findOne.mockResolvedValue(movie)

    const result = await getMovie(movieId, user)

    // Assertions
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(result).toEqual(movie)
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })

  it('should throw NotFoundError if the movie does not exist', async () => {
    const movieId = '123'
    const user = 'user123'

    // Mocking the Movie.findOne function
    Movie.findOne.mockResolvedValue(null)

    const expectedErrorMessage = 'Movie not found'
    CustomError.NotFoundError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(getMovie(movieId, user)).rejects.toEqual({
      message: expectedErrorMessage,
    })
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(CustomError.NotFoundError).toHaveBeenCalledWith(expectedErrorMessage)
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })

  it('should throw UnauthorizedError if the user is not authorized to view the movie', async () => {
    const movieId = '123'
    const user = 'user123'

    // Mocking the Movie.findOne function
    const movie = { _id: movieId, createdBy: 'otherUser', title: 'Test Movie' }
    Movie.findOne.mockResolvedValue(movie)

    const expectedErrorMessage = 'You are not authorized to view this movie'
    CustomError.UnauthorizedError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(getMovie(movieId, user)).rejects.toEqual({
      message: expectedErrorMessage,
    })
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).toHaveBeenCalledWith(
      expectedErrorMessage,
    )
  })

  it('should throw an error if an error occurs during execution', async () => {
    const movieId = '123'
    const user = 'user123'
    const expectedError = new Error('An error occured processing your request')

    // Mocking the Movie.findOne function
    Movie.findOne.mockRejectedValue(expectedError)

    // Assertions
    await expect(getMovie(movieId, user)).rejects.toThrow(expectedError)
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })
})

describe('updateMovie', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should update the movie if it exists and the user is authorized', async () => {
    const movieId = '123'
    const user = 'user123'
    const movieData = { title: 'Updated Movie' }

    // Mocking the Movie.findOne function
    const movie = { _id: movieId, createdBy: user, title: 'Test Movie' }
    Movie.findOne.mockResolvedValue(movie)

    // Mocking the Movie.findOneAndUpdate function
    const updatedMovie = { _id: movieId, createdBy: user, ...movieData }
    Movie.findOneAndUpdate.mockResolvedValue(updatedMovie)

    const result = await updateMovie(movieId, movieData, user)

    // Assertions
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(Movie.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: movieId },
      movieData,
      { new: true, runValidators: true },
    )
    expect(result).toEqual(updatedMovie)
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })

  it('should throw NotFoundError if the movie does not exist', async () => {
    const movieId = '123'
    const user = 'user123'
    const movieData = { title: 'Updated Movie' }

    // Mocking the Movie.findOne function
    Movie.findOne.mockResolvedValue(null)

    const expectedErrorMessage = 'Movie not found'
    CustomError.NotFoundError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(updateMovie(movieId, movieData, user)).rejects.toEqual({
      message: expectedErrorMessage,
    })
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(Movie.findOneAndUpdate).not.toHaveBeenCalled()
    expect(CustomError.NotFoundError).toHaveBeenCalledWith(expectedErrorMessage)
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })

  it('should throw UnauthorizedError if the user is not authorized to update the movie', async () => {
    const movieId = '123'
    const user = 'user123'
    const movieData = { title: 'Updated Movie' }

    // Mocking the Movie.findOne function
    const movie = { _id: movieId, createdBy: 'otherUser', title: 'Test Movie' }
    Movie.findOne.mockResolvedValue(movie)

    const expectedErrorMessage = 'You are not authorized to update this movie'
    CustomError.UnauthorizedError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(updateMovie(movieId, movieData, user)).rejects.toEqual({
      message: expectedErrorMessage,
    })
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(Movie.findOneAndUpdate).not.toHaveBeenCalled()
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).toHaveBeenCalledWith(
      expectedErrorMessage,
    )
  })

  it('should throw an error if an error occurs during execution', async () => {
    const movieId = '123'
    const user = 'user123'
    const movieData = { title: 'Updated Movie' }
    const expectedError = new Error(
      'An error occured processing your request, please try again',
    )

    // Mocking the Movie.findOne function
    Movie.findOne.mockRejectedValue(expectedError)

    // Assertions
    await expect(updateMovie(movieId, movieData, user)).rejects.toThrow(
      expectedError,
    )
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(Movie.findOneAndUpdate).not.toHaveBeenCalled()
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })
})

describe('deleteMovie', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should delete the movie if it exists and the user is authorized', async () => {
    const movieId = '123'
    const user = 'user123'

    // Mocking the Movie.findOne function
    const movie = { _id: movieId, createdBy: user, title: 'Test Movie' }
    Movie.findOne.mockResolvedValue(movie)

    // Mocking the Movie.findOneAndDelete function
    Movie.findOneAndDelete.mockResolvedValue()

    await deleteMovie(movieId, user)

    // Assertions
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(Movie.findOneAndDelete).toHaveBeenCalledWith({ _id: movieId })
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })

  it('should throw NotFoundError if the movie does not exist', async () => {
    const movieId = '123'
    const user = 'user123'

    // Mocking the Movie.findOne function
    Movie.findOne.mockResolvedValue(null)

    const expectedErrorMessage = 'Movie not found'
    CustomError.NotFoundError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(deleteMovie(movieId, user)).rejects.toEqual({
      message: expectedErrorMessage,
    })
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(Movie.findOneAndDelete).not.toHaveBeenCalled()
    expect(CustomError.NotFoundError).toHaveBeenCalledWith(expectedErrorMessage)
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })

  it('should throw UnauthorizedError if the user is not authorized to delete the movie', async () => {
    const movieId = '123'
    const user = 'user123'

    // Mocking the Movie.findOne function
    const movie = { _id: movieId, createdBy: 'otherUser', title: 'Test Movie' }
    Movie.findOne.mockResolvedValue(movie)

    const expectedErrorMessage = 'You are not authorized to delete this movie'
    CustomError.UnauthorizedError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(deleteMovie(movieId, user)).rejects.toEqual({
      message: expectedErrorMessage,
    })
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(Movie.findOneAndDelete).not.toHaveBeenCalled()
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).toHaveBeenCalledWith(
      expectedErrorMessage,
    )
  })

  it('should throw an error if an error occurs during execution', async () => {
    const movieId = '123'
    const user = 'user123'
    const expectedError = new Error('An error occured processing your request')

    // Mocking the Movie.findOne function
    Movie.findOne.mockRejectedValue(expectedError)

    // Assertions
    await expect(deleteMovie(movieId, user)).rejects.toThrow(expectedError)
    expect(Movie.findOne).toHaveBeenCalledWith({ _id: movieId })
    expect(Movie.findOneAndDelete).not.toHaveBeenCalled()
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
    expect(CustomError.UnauthorizedError).not.toHaveBeenCalled()
  })
})

describe('getUserTop100Movies', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the top 100 ranked movies of the user if the user exists and has ranked movies', async () => {
    const userId = '123'
    const user = {
      _id: userId,
      movies: [
        { movieId: 'movie1', rank: 5 },
        { movieId: 'movie2', rank: 3 },
        { movieId: 'movie3', rank: 1 },
      ],
    }

    // Mocking the User.findById function
    User.findById.mockResolvedValue(user)

    // Mocking the Movie.findById function
    const movieDetails1 = { _id: 'movie1', title: 'Movie 1' }
    const movieDetails2 = { _id: 'movie2', title: 'Movie 2' }
    const movieDetails3 = { _id: 'movie3', title: 'Movie 3' }
    Movie.findById
      .mockResolvedValueOnce(movieDetails1)
      .mockResolvedValueOnce(movieDetails2)
      .mockResolvedValueOnce(movieDetails3)

    const expectedResult = [
      { ranking: 1, movie: movieDetails1 },
      { ranking: 3, movie: movieDetails2 },
      { ranking: 5, movie: movieDetails3 },
    ]

    const result = await getUserTop100Movies(userId)

    // Assertions
    expect(User.findById).toHaveBeenCalledWith(userId)
    expect(Movie.findById).toHaveBeenCalledWith('movie1')
    expect(Movie.findById).toHaveBeenCalledWith('movie2')
    expect(Movie.findById).toHaveBeenCalledWith('movie3')
    expect(result).toEqual(expectedResult)
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
  })

  it('should return an empty array if the user exists but has no ranked movies', async () => {
    const userId = '123'
    const user = {
      _id: userId,
      movies: [
        { movieId: 'movie1', rank: 0 },
        { movieId: 'movie2', rank: 0 },
        { movieId: 'movie3', rank: 0 },
      ],
    }

    // Mocking the User.findById function
    User.findById.mockResolvedValue(user)

    const expectedResult = []

    const result = await getUserTop100Movies(userId)

    // Assertions
    expect(User.findById).toHaveBeenCalledWith(userId)
    expect(Movie.findById).not.toHaveBeenCalled()
    expect(result).toEqual(expectedResult)
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
  })

  it('should throw NotFoundError if the user does not exist', async () => {
    const userId = '123'

    // Mocking the User.findById function
    User.findById.mockResolvedValue(null)

    const expectedErrorMessage = 'User not found'
    CustomError.NotFoundError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(getUserTop100Movies(userId)).rejects.toEqual({
      message: expectedErrorMessage,
    })
    expect(User.findById).toHaveBeenCalledWith(userId)
    expect(Movie.findById).not.toHaveBeenCalled()
    expect(CustomError.NotFoundError).toHaveBeenCalledWith(expectedErrorMessage)
  })

  it('should throw an error if an error occurs during execution', async () => {
    const userId = '123'
    const expectedError = new Error('An error occured processing your request')

    // Mocking the User.findById function
    User.findById.mockRejectedValue(expectedError)

    // Assertions
    await expect(getUserTop100Movies(userId)).rejects.toThrow(expectedError)
    expect(User.findById).toHaveBeenCalledWith(userId)
    expect(Movie.findById).not.toHaveBeenCalled()
    expect(CustomError.NotFoundError).not.toHaveBeenCalled()
  })
})

describe('rankMovie', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should update the rank of a movie for the user', async () => {
    // Mock the User model
    const user = {
      _id: 'user1',
      movies: [
        { movieId: 'movie1', rank: 1 },
        { movieId: 'movie2', rank: 2 },
        { movieId: 'movie3', rank: 3 },
      ],
      save: jest.fn(),
    }
    User.findById.mockResolvedValue(user)

    const userId = 'user1'
    const movieId = 'movie2'
    const rank = 5

    await rankMovie(userId, movieId, rank)

    expect(user.movies.find((m) => m.movieId === movieId).rank).toBe(rank)
    expect(user.save).toHaveBeenCalledTimes(1)
  })

  it('should throw NotFoundError if the user is not found', async () => {
    User.findById.mockResolvedValue(null)

    const userId = 'non-existing-user-id'
    const movieId = 'movie1'
    const rank = 5

    // Mocking the User.findById function
    const expectedErrorMessage = 'User not found'
    CustomError.NotFoundError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(rankMovie(userId, movieId, rank)).rejects.toEqual({
      message: expectedErrorMessage,
    })
  })

  it('should throw BadRequestError if the rank is already assigned to another movie', async () => {
    const user = {
      _id: 'user1',
      movies: [
        { movieId: 'movie1', rank: 1 },
        { movieId: 'movie2', rank: 2 },
        { movieId: 'movie3', rank: 3 },
      ],
    }
    User.findById.mockResolvedValue(user)

    const userId = 'user1'
    const movieId = 'movie4' // Assume another movie has already been assigned rank 2
    const rank = 2

    // Mocking the User.findById function
    const expectedErrorMessage = 'The rank is already assigned to a movie'
    CustomError.BadRequestError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(rankMovie(userId, movieId, rank)).rejects.toEqual({
      message: expectedErrorMessage,
    })
  })

  it("should throw BadRequestError if the movie is not found in user's list", async () => {
    const user = {
      _id: 'user1',
      movies: [
        { movieId: 'movie1', rank: 1 },
        { movieId: 'movie2', rank: 2 },
        { movieId: 'movie3', rank: 3 },
      ],
    }
    User.findById.mockResolvedValue(user)

    const userId = 'user1'
    const movieId = 'non-existing-movie-id'
    const rank = 5

    // Mocking the User.findById function
    const expectedErrorMessage = "Movie not found in user's list"
    CustomError.NotFoundError.mockImplementation((message) => ({
      message,
    }))

    // Assertions
    await expect(rankMovie(userId, movieId, rank)).rejects.toEqual({
      message: expectedErrorMessage,
    })
  })
})
