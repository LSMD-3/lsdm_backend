import { DomainError } from '@/exceptions'
import { RestaurantService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'
import abstractRoute from './abstract-route'

const route = Router()

export default (app: Router) => {
  app.use('/restaurant', route)

  route.post('/get_all', body('map').exists().isString(), validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await RestaurantService.getall(req.body.map)
      res.json(response)
    } catch (e) {
      handleError(res, e)
    }
  })
  route.post('/get_tables', body('map').exists().isString(), validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await RestaurantService.getall(req.body.map)
      res.json(response)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.post(
    '/create_table',
    body('restaurant_id').exists().isString(),
    body('table_id').exists().isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.createTable(req.body.restaurant_id, req.body.table_id)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  route.post(
    '/order/create_order',
    body('restaurant_id').exists().isString(),
    body('table_id').exists().isString(),
    body('orders').exists().isArray(),
    body('quantities').exists().isArray(),
    body('notes').exists().isArray(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.createOrder(
          req.body.restaurant_id,
          req.body.table_id,
          req.body.orders,
          req.body.quantities,
          req.body.notes
        )
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

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
