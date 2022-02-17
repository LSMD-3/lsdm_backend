import { Recipe, Restaurant, User } from '@/models'
import { Request, Router, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../../api/middlewares'
import { NeoRecipeService } from '../services'

const route = Router()

export default (app: Router) => {
  app.use('/neo4j/recipe', route)

  //Add User Route
  route.get('/mostLiked/:restaurantId', validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoRecipeService.getMostLikedRecipes(3, req.params.restaurantId)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

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
