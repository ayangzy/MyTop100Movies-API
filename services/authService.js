const User = require('../models/userModel')
const CustomError = require('../errors')

async function registerUser(name, email, password) {
  const emailAlreadyExist = await User.findOne({ email })

  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError('User already exist')
  }

  const user = await User.create({
    name,
    email,
    password,
  })

  const tokenUser = user.createJWT()

  const payload = {
    accessToken: tokenUser,
    user: {
      email: email,
      name: name,
    },
  }

  return payload
}

async function loginUser(email, password) {
  const user = await User.findOne({ email: email })
  if (!user) {
    throw new CustomError.BadRequestError('Invalid credentials')
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new CustomError.BadRequestError('Invalid credentials')
  }

  const tokenUser = user.createJWT()
  const userObjects = {
    email: user.email,
    name: user.name,
  }
  const payload = {
    accessToken: tokenUser,
    user: userObjects,
  }

  return payload
}

module.exports = {
  registerUser,
  loginUser,
}
