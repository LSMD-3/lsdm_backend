import { MenuService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'

const route = Router()

export default (app: Router) => {
  app.use('/menu', route)

  route.post(
    '/create',
    body('restaurantId').isString(),
    body('menu').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await MenuService.createMenu(req.body.restaurantId, req.body.menu)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  // create menu
  route.post(
    '/randommenu/:id',
    body('composition').exists().isArray(),
    body('totalRecipes').exists().isNumeric(),
    body('startPrice').exists().isNumeric(),
    body('endPrice').exists().isNumeric(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const menu = await MenuService.createRandomMenu(req.params.id, req.body)
        res.json(menu)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/deleteMenu',
    body('restaurantId').isString(),
    body('menuIndex').isNumeric(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await MenuService.deleteMenu(req.body.restaurantId, Number(req.body.menuIndex))
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/addRecipeToMenu',
    body('restaurantId').exists(),
    body('menuIndex').isNumeric(),
    body('recipe').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await MenuService.addRecipeToMenu(req.body.restaurantId, Number(req.body.menuIndex), req.body.recipe)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/addRecipesToMenu',
    body('restaurantId').exists(),
    body('menuIndex').isNumeric(),
    body('recipes').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await MenuService.addRecipesToMenu(req.body.restaurantId, Number(req.body.menuIndex), req.body.recipe)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/removeRecipesFromMenu',
    body('restaurantId').exists(),
    body('menuIndex').isNumeric(),
    body('recipeId').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await MenuService.removeRecipesFromMenu(req.body.restaurantId, Number(req.body.menuIndex), req.body.recipeId)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
}
