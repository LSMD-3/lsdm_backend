import { DomainError } from '@/exceptions'
import { UserType } from '@/interfaces'
import { Restaurant, User } from '@/models'
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
    body('customers').exists(),
    body('status').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.createTable(req.body.restaurant_id, req.body.table_id, req.body.customers, req.body.status)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/join_table',
    body('restaurant_id').exists().isString(),
    body('table_id').exists().isString(),
    body('customer').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.join_table(req.body.restaurant_id, req.body.table_id, req.body.customer)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/join_tablenew',
    body('restaurant').exists(),
    body('table_id').exists(),
    body('customer').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.join_tablenew(req.body.restaurant, req.body.table_id, req.body.customer)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/create_tablenew',
    body('restaurant').exists(),
    body('table_id').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.createTablenew(req.body.restaurant, req.body.table_id)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/get_order',
    body('restaurant_id').exists(),
    body('table_id').exists(),
    body('order_id').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.get_order(req.body.restaurant_id, req.body.table_id, req.body.order_id)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  route.post(
    '/clone',
    body('restaurant_id').exists(),
    body('table_id').exists(),

    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.clone(req.body.restaurant_id, req.body.table_id)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/get_all_orders',
    body('restaurant_id').exists(),
    body('table_id').exists(),

    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.get_all_orders(req.body.restaurant_id, req.body.table_id)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/table/check_out',
    body('restaurant').exists(),
    body('table_id').exists(),

    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.checkout_Tablenew(req.body.restaurant, req.body.table_id)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  route.post(
    '/order/create_ordernew',
    body('restaurant').exists(),
    body('table_id').exists(),
    body('customer').exists(),
    body('orders').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.createOrdernew(req.body.restaurant, req.body.table_id, req.body.customer, req.body.orders)
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
    body('user_id').exists().isString(),
    body('orders').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.createOrder(req.body.restaurant_id, req.body.table_id, req.body.user_id, req.body.orders)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/update_order',
    body('restaurant_id').exists().isString(),
    body('table_id').exists().isString(),
    body('order_index').exists(),
    body('orders').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.update_order(
          req.body.restaurant_id,
          req.body.table_id,
          req.body.order_index,
          req.body.orders
        )
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  route.post(
    '/get_orders_for_chef',
    body('restaurant').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.get_orders_for_chef(req.body.restaurant)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  route.post(
    '/update_order_new',
    body('restaurant').exists(),
    body('table_id').exists().isString(),
    body('order_index').exists(),
    body('orders').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.update_ordernew(
          req.body.restaurant,
          req.body.table_id,
          req.body.order_index,
          req.body.orders
        )
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/get_orders_for_chef_new',
    body('restaurant').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.get_orders_for_chefnew(req.body.restaurant)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/table/get_orders_for_user',
    body('restaurant_id').exists().isString(),
    body('table_id').exists().isString(),
    body('user_id').exists().isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.get_orders_for_user(req.body.restaurant_id, req.body.table_id, req.body.user_id)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.post(
    '/table/get_orders_for_user_new',
    body('restaurant').exists(),
    body('table_id').exists().isString(),
    body('customer').exists(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const response = await RestaurantService.get_orders_for_user_new(req.body.restaurant, req.body.table_id, req.body.customer)
        res.json(response)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
  route.post(
    '/get_table_users',
    body('restaurant_id').exists().isString(),
    body('table_id').exists().isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userIds = await RestaurantService.get_table_users(req.body.restaurant_id, req.body.table_id)
        const users = await User.find({ _id: { $in: userIds } }, 'name surname')
        res.json(users)
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

  // create menu
  route.post(
    '/restaurantsByIds',
    body('restaurantIds').exists().isArray(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const restaurants = await RestaurantService.findRestaurantByIds(req.body.restaurantIds)
        res.json(restaurants)
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.get('/noMenu/:limit', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurants = await Restaurant.find({ menu: null }, 'nome').limit(Number(req.params.limit) ?? 10)
      res.json(restaurants)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.get('/withMenu/:limit', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurants = await Restaurant.find({ menu: { $ne: null } }, 'nome').limit(Number(req.params.limit) ?? 10)
      res.json(restaurants)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.get('/restaurantRanking', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comune = req.query.comune
      const response = await RestaurantService.getCheapestRestaurants(comune)
      res.json(response)
    } catch (e) {
      handleError(res, e)
    }
  })

  abstractRoute(route, RestaurantService)
}
