import { Router } from 'express'
import role from './routes/role.route'
import user from './routes/user.route'
import auth from './routes/auth.route'
import restaurant from './routes/restaurant.route'
import recipe from './routes/recipe.route'
import tableSession from './routes/tableSession.route'
import { attachRelationServiceRoutes } from '@/relations-service'

export default () => {
  const app = Router()
  user(app)
  role(app)
  auth(app)
  restaurant(app)
  recipe(app)
  attachRelationServiceRoutes(app)
  tableSession(app)

  return app
}
