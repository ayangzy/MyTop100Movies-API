const authService = require('../services/authService')
const {
  createdResponse,
  successResponse,
} = require('../responses/apiResponses')

exports.register = async (req, res) => {
  const { name, email, password } = req.body

  const payload = await authService.registerUser(name, email, password)
  createdResponse(res, 'User successfully SignedUp', payload)
}

exports.login = async (req, res) => {
  const { email, password } = req.body
  const payload = await authService.loginUser(email, password)
  successResponse(res, 'User loggedIn successfully', payload)
}
