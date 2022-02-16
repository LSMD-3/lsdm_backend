import { Router } from 'express'
import user from './routes/user.route'
import auth from './routes/auth.route'
import restaurant from './routes/restaurant.route'
import recipe from './routes/recipe.route'
import tableSession from './routes/tableSession.route'
import importRoute from './routes/import.route'
import menu from './routes/menu.route'
import { attachRelationServiceRoutes } from '@/relations-service'

export default () => {
  const app = Router()
  user(app)
  auth(app)
  menu(app)
  restaurant(app)
  recipe(app)
  importRoute(app)
  attachRelationServiceRoutes(app)
  tableSession(app)

  return app
}
