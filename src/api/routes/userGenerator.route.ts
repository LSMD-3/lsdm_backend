import { NextFunction, Request, Response, Router } from 'express'
import abstractRoute from './abstract-route'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'
import userGenerator from '@/relations-service/generators/user.generator'

const route = Router()

export default (app: Router) => {
  app.use('/generate', route)

  route.post('/usersfollows', body('id').exists(), body('num').isNumeric(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, num } = req.body
      const result = await userGenerator.generateRandomUserFollows(id, num)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.post('/recipeslikes', body('id').exists(), body('num').isNumeric(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, num } = req.body
      const result = await userGenerator.generateRandomRecipeLike(id, num)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.post('/restaurantslikes', body('id').exists(), body('num').isNumeric(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, num } = req.body
      const result = await userGenerator.generateRandomRestaurantLike(id, num)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })
}
