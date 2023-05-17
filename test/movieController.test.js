const movieService = require('../services/movieService')
const {
  createMovie,
  getAllMovies,
  getMovie,
  updateMovie,
  deleteMovie,
  getTop100Movies,
  rankMovie,
} = require('../controllers/movieController')
const {
  createdResponse,
  successResponse,
} = require('../responses/apiResponses')
const { BadRequestError } = require('../errors')

jest.mock('../services/movieService')
jest.mock('../responses/apiResponses')

describe('createMovie', () => {
  let req
  let res

  beforeEach(() => {
    req = {
      user: {
        userId: 'user123',
      },
      body: {
        adult: true,
        title: 'Movie Title',
        overview: 'description of movie goes here',
        releasedDate: '2023-05-16',
        createdBy: 'user123',
      },
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    createdResponse.mockImplementation(() => {
      return res
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a movie and send a created response', async () => {
    const newMovie = {
      id: 'movie123',
      adult: true,
      title: 'Movie Title',
      overview: 'description of movie goes here',
      releasedDate: '2023-05-16',
      createdBy: 'user123',
    }

    movieService.createMovie.mockResolvedValue(newMovie)

    await createMovie(req, res)

    expect(movieService.createMovie).toHaveBeenCalledWith(
      req.body,
      req.user.userId,
    )
    expect(createdResponse).toHaveBeenCalledWith(
      res,
      'Movie created successfully',
      newMovie,
    )
  })
})

describe('getAllMovies', () => {
  it('should return all movies for the user', async () => {
    // Mock user ID and movies data
    const userId = 'user123'
    const movies = [
      { id: 'movie1', title: 'Movie 1' },
      { id: 'movie2', title: 'Movie 2' },
    ]

    // Mock req and res objects
    const req = { user: { userId } }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Mock the movieService.getAllMovies function
    movieService.getAllMovies = jest.fn().mockResolvedValue(movies)

    // Call the getAllMovies controller
    await getAllMovies(req, res)

    // Checking that the movieService.getAllMovies function was called with the correct userId
    expect(movieService.getAllMovies).toHaveBeenCalledWith(userId)

    expect(successResponse).toHaveBeenCalledWith(
      res,
      'Movies retrieved successfully',
      movies,
    )
  })
})

describe('getMovie', () => {
  it('should return the movie by ID for the user', async () => {
    // Mock user ID and movie ID
    const userId = 'user123'
    const movieId = 'movie123'

    // Mock req and res objects
    const req = { user: { userId }, params: { id: movieId } }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Mock the movieService.getMovie function
    const movie = { id: movieId, title: 'Movie 1' }
    movieService.getMovie = jest.fn().mockResolvedValue(movie)

    // Call the getMovie controller
    await getMovie(req, res)

    // Checking that the movieService.getMovie function was called with the correct movieId and userId
    expect(movieService.getMovie).toHaveBeenCalledWith(movieId, userId)

    // Checking that the response status and JSON methods were called with the correct values
    expect(successResponse).toHaveBeenCalledWith(
      res,
      'Movie retrieved successfully',
      movie,
    )
  })
})

describe('updateMovie', () => {
  it('should update the movie and return the updated movie', async () => {
    // Mock user ID, movie ID, and request body
    const userId = 'user123'
    const movieId = 'movie123'
    const requestBody = { title: 'Updated Movie' }

    // Mock req and res objects
    const req = { user: { userId }, params: { id: movieId }, body: requestBody }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Mock the movieService.updateMovie function
    const updatedMovie = { id: movieId, title: 'Updated Movie' }
    movieService.updateMovie = jest.fn().mockResolvedValue(updatedMovie)

    // Call the updateMovie controller
    await updateMovie(req, res)

    // Checking that the movieService.updateMovie function was called with the correct movieId, requestBody, and userId
    expect(movieService.updateMovie).toHaveBeenCalledWith(
      movieId,
      requestBody,
      userId,
    )

    // Checking that the response status and JSON methods were called with the correct values
    expect(successResponse).toHaveBeenCalledWith(
      res,
      'Movie updated successfully',
      updatedMovie,
    )
  })
})

describe('deleteMovie', () => {
  it('should delete the movie', async () => {
    // Mock user ID and movie ID
    const userId = 'user123'
    const movieId = 'movie123'

    // Mock req and res objects
    const req = { user: { userId }, params: { id: movieId } }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Mock the movieService.deleteMovie function
    movieService.deleteMovie = jest.fn()

    // Call the deleteMovie controller
    await deleteMovie(req, res)

    // Checking that the movieService.deleteMovie function was called with the correct movieId and userId
    expect(movieService.deleteMovie).toHaveBeenCalledWith(movieId, userId)

    // Checking that the response status and JSON methods were called with the correct values
    expect(successResponse).toHaveBeenCalledWith(
      res,
      'Movie deleted successfully',
    )
  })
})

describe('getTop100Movies', () => {
  it('should return the top 100 movies for the user', async () => {
    // Mock user ID
    const userId = 'user123'

    // Mock req and res objects
    const req = { user: { userId } }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Mock the movieService.getUserTop100Movies function
    const topMovies = ['Movie 1', 'Movie 2']
    movieService.getUserTop100Movies = jest.fn().mockResolvedValue(topMovies)

    // Call the getTop100Movies controller
    await getTop100Movies(req, res)

    // Check that the movieService.getUserTop100Movies function was called with the correct userId
    expect(movieService.getUserTop100Movies).toHaveBeenCalledWith(userId)

    // Check that the response status and JSON methods were called with the correct values

    expect(successResponse).toHaveBeenCalledWith(
      res,
      'Top movies retreived successfully',
      topMovies,
    )
  })
})

describe('rankMovie', () => {
  it('should rank the movie and return a success response', async () => {
    // Mock user ID, movie ID, rank, and request body
    const userId = 'user123'
    const movieId = 'movie123'
    const rank = 5

    // Mock req and res objects
    const req = {
      user: { userId },
      params: { movieId },
      body: { rank },
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    // Mock the movieService.rankMovie function
    movieService.rankMovie = jest.fn()

    // Call the rankMovie controller
    await rankMovie(req, res)

    // Checking that the movieService.rankMovie function was called with the correct userId, movieId, and rank
    expect(movieService.rankMovie).toHaveBeenCalledWith(userId, movieId, rank)

    // Checking that the response status and JSON methods were called with the correct values
    expect(successResponse).toHaveBeenCalledWith(
      res,
      'Movie ranked successfully',
    )
  })
})
