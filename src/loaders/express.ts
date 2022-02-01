import { handleError } from '@/api/middlewares'
import config from '@/config'
import { DomainError } from '@/exceptions'
import express, { NextFunction, Response, Request } from 'express'
import routes from '@/api'
import { gusto, helloWorld } from '@/py-modules'

export default ({ app }: { app: express.Application }) => {
  app.get('/status', (req, res) => {
    res.status(200).end()
  })

  app.head('/status', (req, res) => {
    res.status(200).end()
  })

  app.enable('trust proxy')

  app.use(express.urlencoded({ extended: true }))

  app.use(express.urlencoded({ extended: true, type: 'image/*', limit: '10mb' }))

  app.use(
    '/static',
    express.static('src/static', { immutable: true, dotfiles: 'deny', fallthrough: false, maxAge: '1h' }),
    (err: any, req: Request, res: Response, next: NextFunction) => {
      if (err) {
        //Avoid leaking paths on the response
        err.path = ''
        next(err)
      }
      next()
    }
  )

  app.use(express.json())

  // Load API routes
  app.use(config.api.prefix || '/api', routes())

  app.use((req, res, next) => {
    const err = new DomainError('Not Found', 404, 0)
    next(err)
  })

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') return res.status(err.status).send({ message: err.message }).end()

    return next(err)
  })

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.httpStatus ?? 500)
    handleError(res, err)
  })
}
