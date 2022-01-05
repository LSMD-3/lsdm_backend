import { webhookUtils } from '@/utils'
import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { DomainError, NOT_AUTHORIZED_CODE } from '@/exceptions'
import config from '@/config'
import { AuthService } from '@/services'
import { IUser } from '@/interfaces'

export function handleError(res: Response, error: any) {
  if (config.enableDiscordLogging) {
    const webhookMessage = `[${error.message}] ${res.req.path}`
    webhookUtils.sendWebhook('ERROR', webhookMessage)
  }
  if (error instanceof DomainError) return res.status(error.httpStatus).json({ error: error.message, ...error, name: undefined })
  console.log({ error })

  return res.status(500).json({ error })
}

export function validateInput(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json(errors.array())
  next()
}

export function dateValidator(value: number) {
  if (!value) return true
  if (value > Date.now()) {
    return false
  }
  try {
    const date = new Date(value)
    return true
  } catch (e) {
    return false
  }
}

export function isDate(value: any) {
  try {
    const date = new Date(value)
    return true
  } catch (e) {
    return false
  }
}

export async function verifyAuthToken(req: Request, res: Response, next: NextFunction) {
  try {
    let authToken = req.headers.authorization
    const user = await AuthService.verifyAuthToken(authToken)
    let error
    if (user.locked !== undefined && user.locked)
      new DomainError('', 403, NOT_AUTHORIZED_CODE.USER_LOCKED, 'Missing permissions', 'You are not authorized to call this API')
    if (error) return handleError(res, error)
    res.locals.user = user
    next()
  } catch (e) {
    handleError(res, e)
  }
}

export const HasPermissions = (permissions: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as IUser
    if (true || user.role!.sudo || permissionCheck(permissions, user.role!.permissionKeys)) return next()
    const error = new DomainError(
      '',
      401,
      NOT_AUTHORIZED_CODE.MISSING_PERMISSION,
      'Missing permissions',
      'You are not authorized to call this API'
    )
    handleError(res, error)
    return
  }
}

function includesAllElements(array: any[], target: any[]): boolean {
  return target.every((e) => array.includes(e))
}

function permissionCheck(permissionToCheck: string | string[], permissions: string[]): boolean {
  if (typeof permissionToCheck === 'string') return permissions.indexOf(permissionToCheck) >= 0
  return includesAllElements(permissionToCheck, permissions)
}
