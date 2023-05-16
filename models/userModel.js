const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
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

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
  const token = jwt.sign(
    { userId: this._id, name: this.name, email: this.email },
    process.env.JWT_SERCRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    },
  )
  return token
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password)
  return isMatch
}

const User = mongoose.model('User', UserSchema)

module.exports = User
