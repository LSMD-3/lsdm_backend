import { IMenu, IRestaurant, RESTAURANT_PERMISSIONS } from '@/interfaces'
import { Restaurant } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'

class RestaurantService extends AbstractService<IRestaurant> {
  public getEntityManager = () => Restaurant
  public getPermissions = () => RESTAURANT_PERMISSIONS
  public projectFieldsSearch = (type: ProjectType) => {
    if (type === 'base') return 'all'
    return '_id'
  }
  blackListUpdateFields = { latitudine: 1, longitudine: 1 }

  public async getMenu(restaurantId: string): Promise<IMenu | undefined> {
    const restaurant = await Restaurant.findOne({ _id: restaurantId }, 'menu')
    if (!restaurant) return undefined
    return restaurant.menu as IMenu
  }

  public async createMenu(): Promise<IMenu> {
    //todo
  }

  public async updateMenu(): Promise<IMenu> {
    //todo
  }

  public async deleteMenu(): Promise<void> {
    //todo
  }
}

export default new RestaurantService()
