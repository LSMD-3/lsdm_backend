import { Document } from 'mongoose'
import { IRecipe, IRestaurant, IUser } from '..'

export interface MenuRecipe {
  _id: string
  recipe_name: string
  image_url?: string
  category?: string
  ingredients: { name: string; url: string }[]
  quantity: number
  orderNumber: number
}

export interface IOrder {
  client: IUser
  recipes: MenuRecipe[]
}

export interface ITableSession extends Document {
  _id?: string
  restaurant: IRestaurant
  tableId: string
  partecipants: IUser[]
  orders: IOrder[]
}

export const TABLE_SESSION_PERMISSIONS = {
  CREATE: 'TableSession.create',
  UPDATE: 'TableSession.update',
  DELETE: 'TableSession.delete',
  READ: 'TableSession.read',
}
