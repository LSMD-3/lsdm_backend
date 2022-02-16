import { IMenu, IRecipe, MenuRecipe, MenuRecipes, RECIPE_PERMISSIONS } from '@/interfaces'
import { Recipe, Restaurant, User } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'
import recipeService from '@/relations-service/services/recipe.service'
import { Neo4jClient } from '@/relations-service/utils/Neo4jClient'
import restaurantService from '@/relations-service/services/restaurant.service'

// Here we suppose that recipes are already in Neo4j
interface MenuCreationPreferences {
  composition: { category: string; percentage: number }[]
  totalRecipes: number
  startPrice: number
  endPrice: number
}

class MenuService {
  public async createMenu(restaurantId: string, menu: IMenu) {
    const restaurant = await Restaurant.findById(restaurantId, 'menus')
    if (!restaurant) throw new Error('Restaurant not found')

    restaurant.menus.push(menu)
    await restaurant.save()

    if (menu.recipes.length !== 0) {
      // store relations in neo

      try {
        await restaurantService.createMultipleRelation(
          restaurantId,
          'HAS',
          menu.recipes.map((r) => String(r._id)),
          'Recipes'
        )
      } catch (error) {
        // ROLLBACK MONGO
        console.log(error)
        restaurant.menus.pop()
        await restaurant.save()
        return 'ko'
      }
    }
    return 'ok'
  }

  public async addRecipeToMenu(restaurantId: string, menuIndex: number, recipe: MenuRecipes) {
    const restaurant = await Restaurant.findById(restaurantId, 'menus')
    if (!restaurant) throw new Error('Restaurant not found')

    restaurant.menus[menuIndex].recipes.push(recipe)
    await restaurant.save()

    try {
      console.log(restaurantId, 'HAS', String(recipe._id), 'Recipes')
      await restaurantService.createRelation(restaurantId, 'HAS', String(recipe._id), 'Recipes')
    } catch (error) {
      // ROLLBACK MONGO
      restaurant.menus[menuIndex].recipes.pop()
      await restaurant.save()
      return 'add failed'
    }

    return 'ok'
  }

  public async addRecipesToMenu(restaurantId: string, menuIndex: number, recipes: MenuRecipes[]) {
    const restaurant = await Restaurant.findById(restaurantId, 'menus')
    if (!restaurant) throw new Error('Restaurant not found')
    const oldRecipes = [...restaurant.menus[menuIndex].recipes]

    restaurant.menus[menuIndex].recipes = restaurant.menus[menuIndex].recipes.concat(recipes)
    await restaurant.save()

    try {
      await restaurantService.createMultipleRelation(
        restaurantId,
        'HAS',
        recipes.map((r) => r._id),
        'Recipes'
      )
    } catch (error) {
      // ROLLBACK MONGO
      console.log(error)
      restaurant.menus[menuIndex].recipes = oldRecipes
      await restaurant.save()
      return 'add failed'
    }

    return 'ok'
  }

  public async removeRecipesFromMenu(restaurantId: string, menuIndex: number, recipesToRemove: string[]) {
    const restaurant = await Restaurant.findById(restaurantId, 'menus')
    if (!restaurant) throw new Error('Restaurant not found')

    const newRecipes = restaurant.menus[menuIndex].recipes.filter((r) => !recipesToRemove.includes(String(r._id)))

    if (restaurant.menus.length > 1) {
      const recipesInOthersMenus = restaurant.menus.reduce((curr: MenuRecipes[], acc) => curr.concat(acc.recipes), [])
      const recipesIds = recipesInOthersMenus.map((r) => String(r._id))
      const uniqueRecipeIds = [...new Set(recipesIds)]
      const cleanRecipesToRemove = recipesToRemove.filter((r) => !uniqueRecipeIds.includes(r))
      // attach recipes to remaining menus
      await restaurantService.deleteMultipleRelation(restaurantId, 'HAS', cleanRecipesToRemove, 'Recipes')
    } else {
      await restaurantService.deleteMultipleRelation(restaurantId, 'HAS', recipesToRemove, 'Recipes')
    }

    restaurant.menus[menuIndex].recipes = newRecipes
    await restaurant.save()

    return 'ok'
  }

  // connect this api
  public async deleteMenu(restaurantId: string, menuIndex: number) {
    const restaurant = await Restaurant.findById(restaurantId, 'menus')
    if (!restaurant) throw new Error('Restaurant not found')

    const menuToRemove = restaurant.menus.splice(menuIndex, 1)

    if (restaurant.menus.length > 0) {
      const recipesInOthersMenus = restaurant.menus.reduce((curr: MenuRecipes[], acc) => curr.concat(acc.recipes), [])
      const recipesIds = recipesInOthersMenus.map((r) => String(r._id))
      const uniqueRecipeIds = [...new Set(recipesIds)]
      const recipesToRemove = menuToRemove[0].recipes.map((r) => String(r._id))
      const cleanRecipesToRemove = recipesToRemove.filter((r) => !uniqueRecipeIds.includes(r))
      // attach recipes to remaining menus
      await restaurantService.deleteMultipleRelation(restaurantId, 'HAS', cleanRecipesToRemove, 'Recipes')
    } else {
      await restaurantService.deleteAllRelations(restaurantId, 'HAS')
    }

    await restaurant.save()
  }

  private async fetchRecipe(category: string, limit: number) {
    const recipes = await Recipe.find({ category: category }).limit(limit)
    return recipes
  }

  private getRandomPrice(start: number, end: number) {
    if (end < start) return 10
    const diff = end - start
    const price = Math.trunc(Math.random() * diff) + start
    return price
  }

  public async createRandomMenu(restaurantId: string, preferences: MenuCreationPreferences): Promise<string> {
    const restaurant = await Restaurant.findById(restaurantId, 'nome menus')
    if (!restaurant) return 'restaurant not found'

    let n = preferences.totalRecipes
    let totalPercentages = preferences.composition.reduce((prev, curr) => prev + curr.percentage, 0)

    const promises: any = []
    preferences.composition.forEach((c) => {
      const limit = Math.round((c.percentage / totalPercentages) * n)
      if (limit === 0) return
      promises.push(this.fetchRecipe(c.category, limit))
    })
    const result = await Promise.all(promises)

    const recipes: any[] = []

    result.forEach((rs) => {
      rs.forEach((recipe: IRecipe) => {
        recipes.push({
          _id: recipe._id,
          category: recipe.category,
          image_url: recipe.image_url,
          ingredients: recipe.ingredients,
          recipe_link: recipe.recipe_link,
          recipe_name: recipe.recipe_name,
          price: this.getRandomPrice(preferences.startPrice, preferences.endPrice),
        })
      })
    })

    const menu: IMenu = {
      ayce: false,
      name: restaurant.nome + ' menu',
      recipes: recipes,
    }

    return await this.createMenu(restaurantId, menu)
  }
}

export default new MenuService()
