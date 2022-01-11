import { Neo4jService } from '@/services'
import { Request, Router, Response, NextFunction } from 'express'
import { body } from 'express-validator'
import { handleError, validateInput } from '../middlewares'

const route = Router()

export default (app: Router) => {
  app.use('/neo4j', route)
  route.post(
    '/addUser',
    body('_id').exists(),
    body('name').isString(),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await Neo4jService.addUser(req.body)
        res.json(result)
      } catch (e) {
        handleError(res, e)
      }
    }
  )
}
