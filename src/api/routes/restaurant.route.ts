import { RestaurantService } from '@/services'
import { Router } from 'express'
import abstractRoute from './abstract-route'

const route = Router()

export default (app: Router) => {
  app.use('/restaurant', route)
  abstractRoute(route, RestaurantService)
}
