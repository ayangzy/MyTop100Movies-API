const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name field is required'],
  },
  email: {
    type: String,
    required: [true, 'The email field is required'],
  },
  password: {
    type: String,
    required: [true, 'The password field is required'],
    minlength: 6,
  },
  movies: [
    {
      movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
      },
      rank: {
        type: Number,
        required: true,
      },
    },
  ],
})

const User = mongoose.model('User', userSchema)

module.exports = User
