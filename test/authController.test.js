const authService = require('../services/authService')
const { login, register } = require('../controllers/authController')

jest.mock('../services/authService')

describe('Auth Controller', () => {
  let req, res

  beforeEach(() => {
    req = {
      body: {},
    }
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user', async () => {
      const name = 'John Doe'
      const email = 'john.doe@example.com'
      const password = 'password123'
      const payload = { id: 1, name, email }

      req.body = { name, email, password }
      authService.registerUser.mockResolvedValue(payload)

      await register(req, res)

      expect(authService.registerUser).toHaveBeenCalledWith(
        name,
        email,
        password,
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.send).toHaveBeenCalledWith({
        statusCode: 201,
        statusText: 'created',
        message: 'User successfully SignedUp',
        data: payload,
      })
    })
  })

  describe('login', () => {
    it('should log in an existing user', async () => {
      const email = 'john.doe@example.com'
      const password = 'password123'
      const payload = { id: 1, email }

      req.body = { email, password }
      authService.loginUser.mockResolvedValue(payload)

      await login(req, res)

      expect(authService.loginUser).toHaveBeenCalledWith(email, password)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith({
        statusCode: 200,
        statusText: 'success',
        message: 'User loggedIn successfully',
        data: payload,
      })
    })
  })
})
