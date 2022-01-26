import { IRecipe, RECIPE_PERMISSIONS } from '@/interfaces'
import { Recipe } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'

interface Category {
  category: string
  totalRecipe: number
}

class RecipeService extends AbstractService<IRecipe> {
  public getEntityManager = () => Recipe
  public getPermissions = () => RECIPE_PERMISSIONS
  public projectFieldsSearch = (type: ProjectType) => {
    if (type === 'base') return 'all'
    return '_id'
  }
  blackListUpdateFields = {}

  public async getCategories(): Promise<Category[]> {
    const categories = await Recipe.aggregate([
      {
        $group: {
          _id: '$category',
          totalRecipes: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          totalRecipes: '$totalRecipes',
          category: '$_id',
        },
      },
      {
        $match: {
          _id: {
            $ne: null,
          },
          totalRecipes: {
            $gt: 20,
          },
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
    ])
    return categories
  }

  public async getRecipesByIds(ids: string[]) {
    const recipes = await Recipe.find({ _id: { $in: ids } })
    return recipes
  }

  public async getRecipesWithIngredients(ingredient: string) {
    const pipeline = [
      {
        $project: {
          ingredients: 1,
          category: 1,
        },
      },
      {
        $match: {
          'ingredients.url': '/ingrediente/' + ingredient,
        },
      },
      {
        $group: {
          _id: '$category',
          recipes: {
            $push: '$_id',
          },
        },
      },
      {
        $lookup: {
          from: 'recipes',
          localField: 'recipes',
          foreignField: '_id',
          as: 'recipesExt',
        },
      },
      {
        $project: {
          recipes: '$recipesExt',
        },
      },
    ]
    const recipes = await Recipe.aggregate(pipeline)
    return recipes
  }
}

export default new RecipeService()
