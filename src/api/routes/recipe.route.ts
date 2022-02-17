import { RecipeService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import abstractRoute from './abstract-route'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'
import { Recipe } from '@/models'

const route = Router()

export default (app: Router) => {
  app.use('/recipe', route)

  route.get('/image/:recipeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recipesImages = await Recipe.findOne({ _id: req.params.recipeId }, 'image_url')
      res.json(recipesImages)
    } catch (e) {
      handleError(res, e)
    }
  })

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

  route.get('/sample/:limit', async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number(req.params.limit) ?? 10
    try {
      const recipes = await Recipe.aggregate([{ $sample: { size: limit } }, { $project: { recipe_name: 1 } }])
      res.json(recipes)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.get('/byIngredient/:ingredient', async (req: Request, res: Response, next: NextFunction) => {
    const ingredient = req.params.ingredient ?? 'salmone'
    try {
      const recipes = await RecipeService.getRecipesWithIngredients(ingredient)
      res.json(recipes)
    } catch (e) {
      handleError(res, e)
    }
  })

  abstractRoute(route, RecipeService)
}
