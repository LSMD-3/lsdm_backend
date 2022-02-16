import { ImportService, RecipeService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import abstractRoute from './abstract-route'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'
import { Recipe } from '@/models'

const route = Router()

export default (app: Router) => {
  app.use('/import', route)

  route.post('/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ImportService.importUsersFromMongoToNeo4j()
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })
}
