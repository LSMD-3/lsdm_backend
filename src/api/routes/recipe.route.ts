import { RecipeService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import abstractRoute from './abstract-route'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'

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

  route.post(
    '/getrecipebyid',
    body('recipeIds').exists().isArray(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const categories = await RecipeService.getRecipesByIds(req.body.recipeIds)
        res.json(categories)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  abstractRoute(route, RecipeService)
}
