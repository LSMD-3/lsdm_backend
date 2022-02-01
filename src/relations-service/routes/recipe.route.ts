import { Recipe, Restaurant, User } from '@/models'
import { Request, Router, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../../api/middlewares'
import { NeoRecipeService } from '../services'

const route = Router()

export default (app: Router) => {
  app.use('/neo4j/recipe', route)

  //Add Recipe Route
  route.post(
    '/create',
    body('_id').exists(),
    body('name').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { _id, name } = req.body
        const result = await NeoRecipeService.createNode({ _id, name })
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/addIngredient',
    body('recipeId').isString(),
    body('ingredientId').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { recipeId, ingredientId } = req.body
        const result = await NeoRecipeService.createRelation(recipeId, 'HAS', ingredientId, 'Ingredient')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.delete(
    '/addIngredient',
    body('recipeId').isString(),
    body('ingredientId').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { recipeId, ingredientId } = req.body
        const result = await NeoRecipeService.deleteRelation(recipeId, 'HAS', ingredientId, 'Ingredient')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //Delete All Nodes
  route.delete('/all', validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoRecipeService.deleteAllNodes()
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })
}
