import { Recipe, Restaurant, User } from '@/models'
import { Request, Router, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../../api/middlewares'
import { NeoUserService } from '../services'

const route = Router()

export default (app: Router) => {
  app.use('/neo4j/user', route)

  // Create user node
  route.post(
    '/create',
    body('_id').isString(),
    body('email').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { _id, email } = req.body
        const result = await NeoUserService.createNode({ _id, email })
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  // User Follows User
  route.post(
    '/followUser',
    body('follower').isString(),
    body('followee').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { follower, followee } = req.body
        const result = await NeoUserService.createRelation(follower, 'FOLLOWS', followee, 'User')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  // User Unfollows User
  route.post(
    '/deletefollowUser',
    body('follower').isString(),
    body('followee').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { follower, followee } = req.body
        const result = await NeoUserService.deleteRelation(follower, 'FOLLOWS', followee, 'User')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Likes Restaurant
  route.post(
    '/likeRestaurant',
    body('userId').isString(),
    body('restaurant').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId, restaurant } = req.body
        const result = await NeoUserService.createRelation(userId, 'LIKES', restaurant, 'Restaurant')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Unikes Restaurant
  route.post(
    '/deletelikeRestaurant',
    body('userId').isString(),
    body('restaurant').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId, restaurant } = req.body
        const result = await NeoUserService.deleteRelation(userId, 'LIKES', restaurant, 'Restaurant')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Likes Recipe
  route.post(
    '/likeRecipe',
    body('userId').isString(),
    body('recipeId').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId, recipeId } = req.body
        const result = await NeoUserService.createRelation(userId, 'LIKES', recipeId, 'Recipe')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Unlikes Recipe
  route.post(
    '/deletelikeRecipe',
    body('userId').isString(),
    body('recipeId').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId, recipeId } = req.body
        const result = await NeoUserService.deleteRelation(userId, 'LIKES', recipeId, 'Recipe')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Likes Recipe
  route.post(
    '/eatRecipe',
    body('userId').isString(),
    body('recipeId').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId, recipeId } = req.body
        const result = await NeoUserService.createRelation(userId, 'EATS', recipeId, 'Recipe')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Unlikes Recipe
  route.post(
    '/deleteeatRecipe',
    body('userId').isString(),
    body('recipeId').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId, recipeId } = req.body
        const result = await NeoUserService.deleteRelation(userId, 'EATS', recipeId, 'Recipe')
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  // Get All Followers
  route.get('/followers/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.getFollowers(req.params.userId)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  // Get All Followers count
  route.get('/countFollowers/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.getTotalFollowers(req.params.userId)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  // Get All Follows
  route.get('/follows/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.getTotalFollows(req.params.userId)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  // Get All Followers count
  route.get('/countFollows/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.getTotalFollows(req.params.userId)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  //Get Friends Suggestion
  route.get('/suggestfriends/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.suggestOtherFriends(req.params.userId)
      // todo remove from here
      const users = await User.find({ _id: { $in: result } }, 'name surname')

      res.json(users)
    } catch (error) {
      handleError(res, error)
    }
  })

  //Get Recipes Suggestion based on followfriends and their other likes
  route.get('/suggestrecipes/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.suggestOtherRecipes(req.params.userId)
      const recipes = await Recipe.find({ _id: { $in: result } }, 'recipe_name')

      res.json(recipes)
    } catch (error) {
      handleError(res, error)
    }
  })

  //Get Recipes Suggestion based on liked recipes category
  route.get('/suggestrecipescat/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.suggestOtherRecipesCat(req.params.userId)
      res.json(result)
    } catch (error) {
      handleError(res, error)
    }
  })

  //Get Restaurant Suggestion
  route.get('/suggestrestaurants/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.suggestOtherRestaurants(req.params.userId)
      const restaurants = await Restaurant.find({ _id: { $in: result } }, 'nome')

      res.json(restaurants)
    } catch (error) {
      handleError(res, error)
    }
  })

  //Delete All Nodes
  route.delete('/all', validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NeoUserService.deleteAllNodes()
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })
}
