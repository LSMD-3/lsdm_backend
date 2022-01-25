import { Neo4jService } from '@/services'
import { Request, Router, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'

const route = Router()

export default (app: Router) => {
  app.use('/neo4j', route)

  //Add User Route
  route.post('/adduser', body('user').exists(), validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await Neo4jService.addUser(req.body.user)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

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
  route.post('/addrestaurant', body('restaurant').exists(), validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await Neo4jService.addRestaurant(req.body.restaurant)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

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
    '/likeRestaurant',
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

  //User Likes Recipe
  route.post(
    '/likeRecipe',
    body('user').isString(),
    body('recipe').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.userLikesRecipe(req.body.user, req.body.recipe)
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
        const result = await Neo4jService.recipeFoundInRestaurant(req.body.recipe, req.body.restaurant)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Unfollows User
  route.post(
    '/unfollowUser',
    body('follower').isString(),
    body('followee').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.userUnfollowsUser(req.body.follower, req.body.followee)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Unlikes Recipe
  route.post(
    '/unlikeRecipe',
    body('user').isString(),
    body('recipe').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.userUnlikesRecipe(req.body.user, req.body.recipe)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //User Unlikes Restaurant
  route.post(
    '/unlikeRestaurant',
    body('user').isString(),
    body('restaurant').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.userUnlikesRestaurant(req.body.user, req.body.restaurant)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //Recipe Unavailable in Restaurant
  route.post(
    '/unavailableRecipe',
    body('recipe').isString(),
    body('restaurant').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.recipeUnavailableRestaurant(req.body.recipe, req.body.restaurant)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  //Delete All Nodes
  route.delete('/deleteAll', validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await Neo4jService.deleteNodes()
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  //Search for Users
  route.get('/search/:user', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await Neo4jService.searchUsers(req.params.user)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  //Get Total Followers
  route.get('/followers/:user', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await Neo4jService.getFollowers(req.params.user)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  //Get Total Follows Count
  route.get('/follows/:user', async (req: Request, res: Response, next: NextFunction)=>{
    try {
      const result = await Neo4jService.getTotalFollows(req.params.user)
      res.json(result)
    } catch (e) {
      handleError(res,e)
    }
  })

  //Get Total Follows IDs
  route.get('/followsId/:user', async (req:Request, res:Response, next:NextFunction)=>{
    try {
      const result = await Neo4jService.getTotalFollowsID(req.params.user)
      res.json(result)
    } catch (error) {
      handleError(res, error)
    }
  })

  //Get Friends Suggestion
  route.get('/suggestfriends/:user', async (req:Request, res:Response, next:NextFunction)=>{
    try {
      const result = await Neo4jService.suggestOtherFriends(req.params.user)
      res.json(result)
    } catch (error) {
      handleError(res, error)
    }
  })

  //Get Recipes Suggestion
  route.get('/suggestrecipes/:user', async (req:Request, res:Response, next: NextFunction)=>{
    try {
      const result = await Neo4jService.suggestOtherRecipes(req.params.user)
      res.json(result)
    } catch (error) {
      handleError(res, error)
    }
  })

  //Get Restaurant Suggestion
  route.get('/suggestrestaurants/:user', async (req:Request, res:Response, next: NextFunction)=>{
    try {
      const result = await Neo4jService.suggestOtherRestaurants(req.params.user)
      res.json(result)
    } catch (error) {
      handleError(res, error)
    }
  })
}
