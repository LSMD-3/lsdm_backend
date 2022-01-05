import { RecipeService } from '@/services'
import { Router } from 'express'
import abstractRoute from './abstract-route'

const route = Router()

export default (app: Router) => {
  app.use('/recipe', route)
  abstractRoute(route, RecipeService)
}
