import { Document } from 'mongoose'
import { IRecipe, IUser } from '..'
export interface MenuRecipes extends IRecipe {
  price: number
  max_quantity?: number
}

export interface IMenu {
  name: string
  recipes: MenuRecipes[]
  ayce: boolean
}

export interface IRestaurant extends Document {
  img_url: string
  descrizione: string
  tipologia: string
  nome: string
  comune: string
  via: string
  telefono: string
  email: string
  web: string
  latitudine: string
  longitudine: string
  provincia: string
  cap: string
  staff: {
    chefs: IUser[]
    waiters: IUser[]
    admins: IUser[]
  }
  menus: IMenu[]
  menu: IMenu
}

export const RESTAURANT_PERMISSIONS = {
  CREATE: 'resttaurant.create',
  UPDATE: 'resttaurant.update',
  DELETE: 'resttaurant.delete',
  READ: 'resttaurant.read',
}
