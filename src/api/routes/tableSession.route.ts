import { TableSessionService } from '@/services'
import { NextFunction, Request, Response, Router } from 'express'
import abstractRoute from './abstract-route'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'

const route = Router()

export default (app: Router) => {
  app.use('/tableSession', route)

  route.post('/backupFromRedis', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await TableSessionService.backupFromRedis()
      res.json(response)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.get('/recipeRanking/:reduced', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reduced = Boolean(req.params.reduced)
      const response = await TableSessionService.getRecipesRanking(false)
      res.json(response)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.get('/userRanking/:reduced', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reduced = Boolean(req.params.reduced)
      const response = await TableSessionService.getUserRanking(false)
      res.json(response)
    } catch (e) {
      handleError(res, e)
    }
  })

  abstractRoute(route, TableSessionService)
}
