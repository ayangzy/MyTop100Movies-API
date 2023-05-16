require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const dbConnect = require('./db/dbConnect')
const bodyParser = require('body-parser')

//routers
const authRoutes = require('./routes/authRoute')
const movieRoutes = require('./routes/movieRoute')
//error handlers
const notFoundMiddleware = require('./middleware/notFound')
const errorHandlerMiddleware = require('./middleware/errorHandler')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.status(200).send({ message: 'Welcome to movie API!!!' })
})

//endpoints
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/movies', movieRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    await dbConnect()

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT} ...`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
