import role from './routes/role.route'
import user from './routes/user.route'
import auth from './routes/auth.route'
import restaurant from './routes/restaurant.route'
import recipe from './routes/recipe.route'
import neo4j from './routes/neo4j.route'
import { Router } from 'express'

export default () => {
  const app = Router()
  user(app)
  role(app)
  auth(app)
  restaurant(app)
  recipe(app)
  neo4j(app)

  return app
}
