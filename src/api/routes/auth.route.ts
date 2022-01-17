import { Router, Request, Response, NextFunction } from 'express'
import { AuthService } from '@/services'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'
import { User } from '@/models'

const route = Router()

export default (app: Router) => {
  app.use('/auth', route)

  route.post(
    '/login',
    body('email').isEmail(),
    body('password').isStrongPassword(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password } = req.body

        const userTokens = await AuthService.login(email, password)
        const user = await User.findOne({ email }, 'name surname userType')
        if (!user) throw new Error('User not found')

        res.json({ _id: user._id, email, name: user.name, surname: user.surname, userType: user.userType, ...userTokens })
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/signup',
    body('email').isEmail(),
    body('password').isStrongPassword(),
    body('name').exists(),
    body('surname').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password, name, surname } = req.body
        const userTokens = await AuthService.signup(email, password, name, surname)
        res.json({ email, name, surname, userType: 'user', ...userTokens })
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/refreshtoken',
    body('refreshToken').exists().isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userTokens = await AuthService.refreshToken(req.body.refreshToken)
        res.json(userTokens)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  //route.post('/register', async (req: Request, res: Response, next: NextFunction) => {})

  route.get('/resetpassword', async (req: Request, res: Response, next: NextFunction) => {})
}
