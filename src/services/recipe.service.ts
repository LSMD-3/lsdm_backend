import { IRecipe, RECIPE_PERMISSIONS } from '@/interfaces'
import { Recipe } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'
import recipeService from '@/relations-service/services/recipe.service'

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

  public async add(data: IRecipe): Promise<IRecipe> {
    const recipe = await super.add(data)
    try {
      await recipeService.createNode({ _id: recipe._id, name: recipe.recipe_name, image_url: recipe.image_url, category: recipe.category })
    } catch (error) {
      await super.delete(data._id)
      throw new Error('Failed to add recipe in neo4j')
    }
    return recipe
  }

  public async update(data: IRecipe): Promise<IRecipe> {
    const recipe = await super.update(data)
    // TODO update neo
    return recipe
  }

  public async delete(recipeId: string) {
    try {
      await recipeService.deleteNode(recipeId)
      await super.delete(recipeId)
    } catch (error) {
      throw new Error('Failed to delete recipe in neo4j')
    }
  }
}

export default new RecipeService()
