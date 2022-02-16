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

  route.post('/recipes', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ImportService.importRecipesFromMongoToNeo4j()
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.post('/restaurants', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ImportService.importRestaurantsFromMongoToNeo4j()
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })
}
