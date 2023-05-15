require('dotenv').config()
const express = require('express')

const app = express()

const dbConnect = require('./db/dbConnect')

app.get('/', (req, res) => {
  res.status(200).send({ message: 'Welcome to job movie!!!' })
})

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
