const CustomAPIError = require('./customApi')
const UnauthenticatedError = require('./unauthenticated')
const NotFoundError = require('./notFound')
const BadRequestError = require('./badRequest')
const ServerError = require('./serverError')
const UnauthorizedError = require('./unauthorized')

module.exports = {
  CustomAPIError,
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
  ServerError,
  UnauthorizedError,
}
