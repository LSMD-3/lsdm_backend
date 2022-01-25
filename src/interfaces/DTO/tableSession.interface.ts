import { Document } from 'mongoose'

export interface IOrder {
  clientId: string
  recipeId: string
  quantity: number
  orderNumber: number
}

export interface ITableSession extends Document {
  _id?: string
  restaurantId: string
  tableId: string
  partecipants: string[]
  orders: IOrder[]
}

export const TABLE_SESSION_PERMISSIONS = {
  CREATE: 'TableSession.create',
  UPDATE: 'TableSession.update',
  DELETE: 'TableSession.delete',
  READ: 'TableSession.read',
}
