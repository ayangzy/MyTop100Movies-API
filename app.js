const express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.status(200).send({ message: 'Welcome to job movie!!!' })
})

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT} ...`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
