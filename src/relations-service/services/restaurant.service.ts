import { BaseNeo4jService } from './baseNeo4j.service'

export interface RestaurantNodeProps {
  _id: string
  name: string
  comune: string
}

class RestaurantService extends BaseNeo4jService<RestaurantNodeProps> {
  constructor() {
    super('Restaurant', [{ to: 'Recipe', relations: ['HAS'] }])
  }
}

export default new RestaurantService()
