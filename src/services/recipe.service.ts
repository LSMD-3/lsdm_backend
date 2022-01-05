import { IRecipe, RECIPE_PERMISSIONS } from '@/interfaces'
import { Recipe } from '@/models'
import { AbstractService } from './abstract.service'

class RecipeService extends AbstractService<IRecipe> {
  public getEntityManager = () => Recipe
  public getPermissions = () => RECIPE_PERMISSIONS
}

export default new RecipeService()
