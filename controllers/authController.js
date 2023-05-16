const authService = require('../services/authService')
const {
  createdResponse,
  successResponse,
} = require('../responses/apiResponses')
const CustomError = require('../errors')
const { BadRequestError } = require('../errors')

exports.register = async (req, res) => {
  const { name, email, password } = req.body
  try {
    const payload = await authService.registerUser(name, email, password)
    createdResponse(res, 'User successfully SignedUp', payload)
  } catch (error) {
    if (error instanceof CustomError.BadRequestError) {
      throw new BadRequestError(error.message)
    }
    throw error
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  try {
    const payload = await authService.loginUser(email, password)
    successResponse(res, 'User loggedIn successfully', payload)
  } catch (error) {
    if (error instanceof CustomError.BadRequestError) {
      throw new BadRequestError(error.message)
    }
    throw error
  }
}
