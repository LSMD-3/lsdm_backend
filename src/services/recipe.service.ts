import { IRecipe, RECIPE_PERMISSIONS } from '@/interfaces'
import { Recipe } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'

class RecipeService extends AbstractService<IRecipe> {
  public getEntityManager = () => Recipe
  public getPermissions = () => RECIPE_PERMISSIONS
  public projectFieldsSearch = (type: ProjectType) => {
    if (type === 'base') return 'all'
    return '_id'
  }
  blackListUpdateFields = {}
}

export default new RecipeService()
