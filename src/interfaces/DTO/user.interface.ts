import { Document } from 'mongoose'
export type UserType = 'user' | 'admin' | 'chef' | 'waiter' | 'super-admin'
export interface IUser extends Document {
  _id: string
  name: string
  surname: string
  email: string
  password: string
  userType: UserType
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
