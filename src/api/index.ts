import role from './routes/role.route'
import user from './routes/user.route'
import auth from './routes/auth.route'
import restaurant from './routes/restaurant.route'
import recipe from './routes/recipe.route'
import { Router } from 'express'

export default () => {
  const app = Router()
  user(app)
  role(app)
  auth(app)
  restaurant(app)
  recipe(app)

  return app
}
