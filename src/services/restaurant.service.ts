import { IMenu, IRecipe, IRestaurant, MenuRecipes, RESTAURANT_PERMISSIONS } from '@/interfaces'
import RedisClient from '@/loaders/redis'
import { Restaurant, Recipe } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'

interface MenuCreationPreferences {
  composition: { category: string; percentage: number }[]
  totalRecipes: number
  startPrice: number
  endPrice: number
}

class RestaurantService extends AbstractService<IRestaurant> {
  public getEntityManager = () => Restaurant
  public getPermissions = () => RESTAURANT_PERMISSIONS
  public projectFieldsSearch = (type: ProjectType) => {
    if (type === 'base') return 'all'
    return '_id'
  }
  blackListUpdateFields = { latitudine: 1, longitudine: 1 }

  public async addOrder() {
    RedisClient.db.HSET('table', 'key1', 'value1')
  }

  public async searchRestaurant(text: string) {
    const restaurants = await Restaurant.find({ nome: { $regex: `${text}`, $options: 'i' } }, 'nome').limit(5)
    return restaurants
  }

  public async getMenu(restaurantId: string): Promise<IMenu | undefined> {
    const restaurant = await Restaurant.findById(restaurantId, 'menu').populate('menu.recipes.recipe')
    if (!restaurant || restaurant.menu.recipes.length === 0) return undefined
    return restaurant.menu as IMenu
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

  public async createMenu(restaurantId: string, preferences: MenuCreationPreferences): Promise<IMenu | undefined> {
    const restaurant = await Restaurant.findById(restaurantId, 'nome')
    if (!restaurant) return undefined

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
          price: this.getRandomPrice(preferences.startPrice, preferences.endPrice),
          recipe: recipe._id,
        })
      })
    })

    const menu: IMenu = {
      ayce_available: true,
      name: restaurant.nome + ' menu',
      recipes: recipes,
    }

    restaurant.menu = menu
    await restaurant.save()
    return await this.getMenu(restaurantId)
  }

  public async updateMenu(): Promise<IMenu> {
    //todo
  }

  public async deleteMenu(): Promise<void> {
    //todo
  }
}

export default new RestaurantService()
