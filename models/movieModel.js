const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  adult: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    required: [true, 'The title field is required'],
  },

  overview: {
    type: String,
    trim: true,
    required: [true, 'The overview field is required'],
  },

  releaseDate: {
    type: Date,
    required: [true, 'The release date field is required'],
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'The user field is required'],
  },
})

const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie
