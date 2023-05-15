const notFoundMiddleware = (req, res, next) => {
  res.status(404).send({ status: 'not_found', message: 'Route not found' })
}

module.exports = notFoundMiddleware
