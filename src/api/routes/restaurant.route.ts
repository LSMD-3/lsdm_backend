import { DomainError } from '@/exceptions'
import { RestaurantService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'
import abstractRoute from './abstract-route'

const route = Router()

export default (app: Router) => {
  app.use('/restaurant', route)

  route.get('/menu/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menu = await RestaurantService.getMenu(req.params.id)
      if (!menu) return res.status(401).json({ error: 'Menu Not Found' })
      res.json(menu)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.post('/menu', body('email').isEmail(), validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menu = await RestaurantService.createMenu()
      res.json('todo')
    } catch (e) {
      handleError(res, e)
    }
  })

  route.put('/menu', body('email').isEmail(), validateInput, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menu = await RestaurantService.updateMenu()
      res.json('todo')
    } catch (e) {
      handleError(res, e)
    }
  })

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
