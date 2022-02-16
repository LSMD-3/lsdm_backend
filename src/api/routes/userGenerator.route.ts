import { NextFunction, Request, Response, Router } from 'express'
import abstractRoute from './abstract-route'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'
import userGenerator from '@/relations-service/generators/user.generator'

const route = Router()

export default (app: Router) => {
  app.use('/generate', route)

  route.post(
    '/usersfollows',
    body('id').exists(),
    body('numOfFollows').isNumeric(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId } = req.body.id
        const { numOfFollows } = req.body.numOfFollows
        const result = await userGenerator.generateRandomUserFollows(userId, numOfFollows)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/recipeslikes',
    body('id').exists(),
    body('numOfFollows').isNumeric(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId } = req.body.id
        const { numOfFollows } = req.body.numOfFollows
        const result = await userGenerator.generateRandomRecipeLike(userId, numOfFollows)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/restaurants',
    body('id').exists(),
    body('numOfFollows').isNumeric(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId } = req.body.id
        const { numOfFollows } = req.body.numOfFollows
        const result = await userGenerator.generateRandomRestaurantLike(userId, numOfFollows)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
}
