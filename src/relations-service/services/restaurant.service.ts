import { BaseNeo4jService } from './baseNeo4j.service'

export interface RestaurantNodeProps {
  id: string
  name: string
  comune: string
}

class RestaurantService extends BaseNeo4jService<RestaurantNodeProps> {
  constructor() {
    super('Restaurant', [{ to: 'Recipes', relations: ['HAS'] }])
  }
}

export default new RestaurantService()
