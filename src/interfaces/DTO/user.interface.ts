import { Document } from 'mongoose'
import { IRole } from '..'

export interface IUser extends Document {
  _id: string
  name: string
  surname: string
  email: string
  password: string
  roleId: string
  role?: IRole
  userType: 'user' | 'admin' | 'chef' | 'waiter' | 'super-admin'
  logins: Date[]
  locked: boolean
  ignoreTokensBefore: Date
  createdAt: Date
  updatedAt: Date
  validatePassword: (password: string) => Promise<boolean>
}

export const USER_PERMISSIONS = {
  CREATE: 'user.create',
  UPDATE: 'user.update',
  DELETE: 'user.delete',
  READ: 'user.read',
}
