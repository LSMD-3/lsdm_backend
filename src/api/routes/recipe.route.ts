import { RecipeService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import { handleError } from '../middlewares'
import abstractRoute from './abstract-route'

const route = Router()

export default (app: Router) => {
  app.use('/recipe', route)

  route.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await RecipeService.getCategories()
      res.json(categories)
    } catch (e) {
      handleError(res, e)
    }
  })

  abstractRoute(route, RecipeService)
}
