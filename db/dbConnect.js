const mongoose = require('mongoose')
const { DB_HOST, DB_PORT, DB_DATABASE } = require('../config/config')
mongoose.set('strictQuery', false)

const connectDB = (url) => {
  return mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('db connection succesful')
    })
    .catch((error) => {
      console.log(error)
      setTimeout(connectDB, 2000)
    })
}

module.exports = connectDB
