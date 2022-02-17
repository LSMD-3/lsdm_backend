import { Recipe, Restaurant, User } from '@/models'
import { Request, Router, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../../api/middlewares'
import { NeoRestaurantService, NeoUserService } from '../services'

const route = Router()

export default (app: Router) => {
  app.use('/neo4j/restaurant', route)

  //Add User Route
  route.get('/mostLiked', validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoRestaurantService.getMostLikedRestaurants(10)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  //Recipe found In Restaurant
  route.post(
    '/hasRecipe',
    body('restaurantId').isString(),
    body('recipeId').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await NeoRestaurantService.createRelation(req.body.restaurantId, 'HAS', req.body.recipeId, 'Recipes')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //Recipes found In Restaurant
  route.delete(
    '/hasRecipe',
    body('restaurantId').isString(),
    body('recipeId').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await NeoRestaurantService.deleteRelation(req.body.restaurantId, 'HAS', req.body.recipeId, 'Recipes')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //Delete All Nodes
  route.delete('/deleteAll', validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoRestaurantService.deleteAllNodes()
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })
}
