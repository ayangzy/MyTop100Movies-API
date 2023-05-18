const { registerUser, loginUser } = require('../services/authService')
const User = require('../models/userModel')
const CustomError = require('../errors')

describe('registerUser', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user and return the payload with access token and user information', async () => {
    // Mock user data
    const name = 'John Doe'
    const email = 'johndoe@example.com'
    const password = 'password123'

    // Mock User.findOne and User.create methods
    User.findOne = jest.fn().mockResolvedValue(null)
    User.create = jest.fn().mockResolvedValue({
      _id: 'user123',
      name,
      email,
      password,
      createJWT: jest.fn().mockReturnValue('accessToken'),
    })

    // Call the registerUser service
    const payload = await registerUser(name, email, password)

    // Check that User.findOne and User.create methods were called with the correct arguments
    expect(User.findOne).toHaveBeenCalledWith({ email })
    expect(User.create).toHaveBeenCalledWith({
      name,
      email,
      password,
    })

    // Check the returned payload
    expect(payload).toEqual({
      accessToken: 'accessToken',
      user: {
        email,
        name,
      },
    })
  })

  it('should throw BadRequestError if the user with the same email already exists', async () => {
    // Mock user data
    const name = 'John Doe'
    const email = 'johndoe@example.com'
    const password = 'password123'

    // Mock User.findOne method to return an existing user
    User.findOne = jest.fn().mockResolvedValue({
      _id: 'user123',
      name,
      email,
      password,
    })

    // Call the registerUser service and expect it to throw BadRequestError
    await expect(registerUser(name, email, password)).rejects.toThrow(
      CustomError.BadRequestError,
    )

    // Check that User.findOne method was called with the correct argument
    expect(User.findOne).toHaveBeenCalledWith({ email })
  })

  it('should throw an error if an error occurs during user registration', async () => {
    // Mock user data
    const name = 'John Doe'
    const email = 'johndoe@example.com'
    const password = 'password123'

    // Mock User.findOne method to throw an error
    User.findOne = jest.fn().mockRejectedValue(new Error('Database error'))

    // Call the registerUser service and expect it to throw an error
    await expect(registerUser(name, email, password)).rejects.toThrow(Error)

    // Check that User.findOne method was called with the correct argument
    expect(User.findOne).toHaveBeenCalledWith({ email })
  })
})

describe('loginUser', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should log in a user and return the payload with access token and user information', async () => {
    // Mock user data
    const email = 'johndoe@example.com'
    const password = 'password123'

    // Mock User.findOne method to return a user
    User.findOne = jest.fn().mockResolvedValue({
      _id: 'user123',
      email,
      name: 'John Doe',
      comparePassword: jest.fn().mockResolvedValue(true),
      createJWT: jest.fn().mockReturnValue('accessToken'),
    })

    // Call the loginUser service
    const payload = await loginUser(email, password)

    // Check that User.findOne method was called with the correct argument
    expect(User.findOne).toHaveBeenCalledWith({ email })

    // Check the returned payload
    expect(payload).toEqual({
      accessToken: 'accessToken',
      user: {
        email,
        name: 'John Doe',
      },
    })
  })

  it('should throw BadRequestError if the user with the given email does not exist', async () => {
    // Mock user data
    const email = 'johndoe@example.com'
    const password = 'password123'

    // Mock User.findOne method to return null
    User.findOne = jest.fn().mockResolvedValue(null)

    // Call the loginUser service and expect it to throw BadRequestError
    await expect(loginUser(email, password)).rejects.toThrow(
      CustomError.BadRequestError,
    )

    // Check that User.findOne method was called with the correct argument
    expect(User.findOne).toHaveBeenCalledWith({ email })
  })

  it('should throw BadRequestError if the password is incorrect', async () => {
    // Mock user data
    const email = 'johndoe@example.com'
    const password = 'password123'

    // Mock User.findOne method to return a user with incorrect password
    User.findOne = jest.fn().mockResolvedValue({
      _id: 'user123',
      email,
      name: 'John Doe',
      comparePassword: jest.fn().mockResolvedValue(false),
    })

    // Call the loginUser service and expect it to throw BadRequestError
    await expect(loginUser(email, password)).rejects.toThrow(
      CustomError.BadRequestError,
    )

    // Check that User.findOne method was called with the correct argument
    expect(User.findOne).toHaveBeenCalledWith({ email })
  })

  it('should throw an error if an error occurs during user login', async () => {
    // Mock user data
    const email = 'johndoe@example.com'
    const password = 'password123'

    // Mock User.findOne method to throw an error
    User.findOne = jest.fn().mockRejectedValue(new Error('Database error'))

    // Call the loginUser service and expect it to throw an error
    await expect(loginUser(email, password)).rejects.toThrow(Error)

    // Check that User.findOne method was called with the correct argument
    expect(User.findOne).toHaveBeenCalledWith({ email })
  })
})
