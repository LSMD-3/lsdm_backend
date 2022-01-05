import { IRestaurant, RESTAURANT_PERMISSIONS } from '@/interfaces'
import { Restaurant } from '@/models'
import { AbstractService } from './abstract.service'

class RestaurantService extends AbstractService<IRestaurant> {
  public getEntityManager = () => Restaurant
  public getPermissions = () => RESTAURANT_PERMISSIONS
}

export default new RestaurantService()
