import { Document } from 'mongoose'

export interface IRecipe extends Document {
  recipe_name: string
  recipe_link: string
}

export const RECIPE_PERMISSIONS = {
  CREATE: 'recipe.create',
  UPDATE: 'recipe.update',
  DELETE: 'recipe.delete',
  READ: 'recipe.read',
}
