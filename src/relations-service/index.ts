import { Router } from 'express'
import recipe from './routes/recipe.route'
import user from './routes/user.route'
import restaurant from './routes/restaurant.route'

export function attachRelationServiceRoutes(app: Router) {
  recipe(app)
  user(app)
  restaurant(app)
}
