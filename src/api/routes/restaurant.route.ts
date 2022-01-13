import { DomainError } from '@/exceptions'
import { UserType } from '@/interfaces'
import { RestaurantService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'
import abstractRoute from './abstract-route'

const route = Router()

export default (app: Router) => {
  app.use('/restaurant', route)

  route.post('/order/add', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await RestaurantService.addOrder()
    } catch (e) {
      handleError(res, e)
    }
  })

  route.post(
    '/staff',
    body('restaurantId').isString(),
    body('userId').isString(),
    body('userType').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { restaurantId, userId, userType } = req.body
        const result = await RestaurantService.addStaffToRestaurant(restaurantId, userId, userType)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.get('/staff/:userId/:userType', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await RestaurantService.findRestaurantOfStaff(req.params.userId, req.params.userType as UserType)
      res.json(result)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.get('/search/:text', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurants = await RestaurantService.searchRestaurant(req.params.text)
      res.json(restaurants)
    } catch (e) {
      handleError(res, e)
    }
  })

  // get menu
  route.get('/menu/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menu = await RestaurantService.getMenu(req.params.id)
      if (!menu) return res.status(401).json({ error: 'Menu Not Found' })
      res.json(menu)
    } catch (e) {
      handleError(res, e)
    }
  })

  // create menu
  route.post(
    '/menu/:id',
    body('composition').exists().isArray(),
    body('totalRecipes').exists().isNumeric(),
    body('startPrice').exists().isNumeric(),
    body('endPrice').exists().isNumeric(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const menu = await RestaurantService.createMenu(req.params.id, req.body)
        res.json(menu)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  // update menu
  route.put('/menu', body('email').isEmail(), validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menu = await RestaurantService.updateMenu()
      res.json('todo')
    } catch (e) {
      handleError(res, e)
    }
  })

  // delete menu
  route.delete('/menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menu = await RestaurantService.deleteMenu()
      res.json('todo')
    } catch (e) {
      handleError(res, e)
    }
  })

  abstractRoute(route, RestaurantService)
}
