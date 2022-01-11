import { Neo4jService } from '@/services'
import { Request, Router, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'

const route = Router()

export default (app: Router) => {
  app.use('/neo4j', route)

  //Add User Route
  route.post(
    '/adduser',
    body('user').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.addUser(req.body.user)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //Add Recipe Route
  route.post(
    '/addrecipe',
    body('recipe').exists(),
    // body('name').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.addRecipe(req.body.recipe)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  
  //Add Restaurant Route
  route.post(
    '/addrestaurant',
    body('restaurant').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.addRestaurant(req.body.restaurant)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Follows User
  route.post(
    '/follow',
    body('follower').isString(),
    body('followee').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.userFollowUser(req.body.follower, req.body.followee)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  
  //User Likes Restaurant
  route.post(
    '/like',
    body('user').isString(),
    body('restaurant').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.userLikesRestaurant(req.body.user, req.body.restaurant)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //Recipe found In Restaurant
  route.post(
    '/found',
    body('recipe').isString(),
    body('restaurant').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.recipeFoundInRestaurant(req.body.recipe,req.body.restaurant)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //Delete All Nodes
  route.delete(
    '/deleteAll',
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.deleteNodes()
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
}
