import { Neo4jClient } from '../utils/Neo4jClient'
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

  async getMostLikedRestaurants(limit: number): Promise<any> {
    //Method to get count of total Users Followed
    const session = Neo4jClient.session()

    try {
      const results = await session.run(`
      MATCH (u:User)-[l:LIKES]->(r:Restaurant)
      RETURN r, COUNT(l)
      ORDER BY COUNT(l)
      LIMIT ${limit}`)
      return results.records.map((f) => {
        const restaurant = f.get('r')
        return restaurant.properties
      })
    } catch (error) {
      console.log(error)
    }
  }
}

export default new RestaurantService()
