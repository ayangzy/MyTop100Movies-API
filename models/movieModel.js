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
  popularity: {
    type: Number,
    default: 1,
  },

  releaseDate: {
    type: Date,
    required: [true, 'The release date field is required'],
  },

  voteAverage: {
    type: Number,
    default: 4.5,
  },

  voteCount: {
    type: Number,
    required: [true, 'The vote count field is required'],
  },
})

const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie
