import { Document } from 'mongoose'
import { IRecipe } from '..'
export interface MenuRecipes {
  recipe: IRecipe
  price: number
  max_quantity?: number
}

export interface IMenu {
  name: string
  description?: string
  recipes: MenuRecipes[]
  ayce_available: boolean
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
  menu: IMenu
}

export const RESTAURANT_PERMISSIONS = {
  CREATE: 'resttaurant.create',
  UPDATE: 'resttaurant.update',
  DELETE: 'resttaurant.delete',
  READ: 'resttaurant.read',
}
