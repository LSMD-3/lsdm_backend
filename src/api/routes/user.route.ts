import { User } from '@/models'
import { Neo4jService, UserService } from '@/services'
import neo4jService from '@/services/neo4j.service'
import { NextFunction, Request, Response, Router } from 'express'
import { body, param } from 'express-validator'
import { dateValidator, handleError, HasPermissions, validateInput, verifyAuthToken } from '../middlewares'
import abstractRoute from './abstract-route'

const route = Router()

export default (app: Router) => {
  app.use('/user', route)

  route.get('/followers/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rowIds = await neo4jService.getFollowers(req.params.userId)
      const ids = rowIds.map((r: any) => r.id)
      const emails = await UserService.getEmailByIds(ids)
      res.json(emails)
    } catch (e) {
      handleError(res, e)
    }
  })

  route.post(
    '/invalidatesessions/:id',
    verifyAuthToken,
    HasPermissions(UserService.getPermissions().UPDATE),
    param('id').exists().isString(),
    body('date').custom(dateValidator),
    validateInput,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await UserService.invalidateSessions(req.params.id, req.body.date)
        res.json({ ok: true })
      } catch (e) {
        handleError(res, e)
      }
    }
  )

  route.get('/followsemails/:userId', async (req:Request, res:Response, next:NextFunction)=>{
    try {
      // console.log(req.params.userId);
      const followsIds = await Neo4jService.getTotalFollowsID(req.params.userId)
      const emails = await UserService.getEmailsOfFollows(followsIds)
      res.json(emails)
    } catch (e) {
      handleError(res, e)
    }
  })

  abstractRoute(route, UserService)
}
