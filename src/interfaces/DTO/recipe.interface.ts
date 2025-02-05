import { Document } from 'mongoose'

export interface IRecipe extends Document {
  _id: string
  recipe_name: string
  recipe_link: string
  image_url?: string
  category?: string
  ingredients: { name: string; url: string }[]
}

export const RECIPE_PERMISSIONS = {
  CREATE: 'recipe.create',
  UPDATE: 'recipe.update',
  DELETE: 'recipe.delete',
  READ: 'recipe.read',
}
