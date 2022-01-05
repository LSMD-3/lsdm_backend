import { IRestaurant, RESTAURANT_PERMISSIONS } from '@/interfaces'
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
}

export default new RestaurantService()
