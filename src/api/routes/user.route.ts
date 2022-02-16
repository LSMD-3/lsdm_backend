import { User } from '@/models'
import { UserService } from '@/services'

import { NextFunction, Request, Response, Router } from 'express'
import { body, param } from 'express-validator'
import { dateValidator, handleError, HasPermissions, validateInput, verifyAuthToken } from '../middlewares'
import abstractRoute from './abstract-route'

const route = Router()

export default (app: Router) => {
  app.use('/user', route)

  route.post(
    '/invalidatesessions/:id',
    verifyAuthToken,
    HasPermissions(UserService.getPermissions().UPDATE),
    param('id').exists().isString(),
    body('date').custom(dateValidator),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await UserService.invalidateSessions(req.params.id, req.body.date)
        res.json({ ok: true })
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.get('/normalUser/:limit', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log(req.params.userId);
      const users = await User.find({ userType: 'user' }, 'name').limit(Number(req.params.limit) ?? 10)
      res.json(users)
    } catch (e) {
      handleError(res, e)
    }
  })

  abstractRoute(route, UserService)
}
