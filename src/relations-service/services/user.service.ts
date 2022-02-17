import { Neo4jClient } from '../utils/Neo4jClient'
import { BaseNeo4jService } from './baseNeo4j.service'

export interface UserNodeProps {
  _id: string
  email: string
  name: string
  surname: string
}

class UserService extends BaseNeo4jService<UserNodeProps> {
  constructor() {
    super('User', [
      { relations: ['EATS', 'LIKES'], to: 'Recipe' },
      { relations: ['FOLLOWS'], to: 'User' },
      { relations: ['LIKES'], to: 'Restaurant' },
    ])
  }

  async getLikedRestaurants(userId: string) {
    const session = Neo4jClient.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})-[LIKES]->(r:Restaurant)return r`)
    return results.records.map((f) => {
      const followIds = f.get('r')
      return followIds.properties.id
    })
  }

  async getLikedRecipes(userId: string) {
    const session = Neo4jClient.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})-[LIKES]->(r:Recipe)return r`)
    return results.records.map((f) => {
      const followIds = f.get('r')
      return followIds.properties.id
    })
  }

  async getTotalFollowers(userId: string): Promise<any> {
    //Method to get count of total Users Followed
    const session = Neo4jClient.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})<-[FOLLOWS]-()return COUNT(FOLLOWS) AS FOLLOWERS`)
    return results.records.map((r) => {
      const followers = r.get('FOLLOWERS')
      return followers.low
    })
  }

  async getFollowers(userId: string): Promise<any> {
    //Method to get count of total Users Followed
    const session = Neo4jClient.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})<-[FOLLOWS]-(u2:User)return  u2`)
    return results.records.map((r) => {
      const followers = r.get('u2')
      return followers.properties
    })
  }

  async getTotalFollows(userId: string): Promise<any> {
    //Method to get count of total Users Followed
    const session = Neo4jClient.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})-[FOLLOWS]->()return COUNT(FOLLOWS) AS FOLLOWERS`)
    return results.records.map((r) => {
      const followers = r.get('FOLLOWERS')
      return followers.low
    })
  }

  async getFollows(userId: string): Promise<any> {
    //Method to get the ID of those you are following
    const session = Neo4jClient.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})-[FOLLOWS]->(u2:User) return u2`)
    return results.records.map((f) => {
      const followIds = f.get('u2')
      return followIds.properties.id
    })
  }

  async suggestOtherFriends(userId: string): Promise<any> {
    //Method that suggest other friends to follow based on friends you are following
    const session = Neo4jClient.session()
    const results = await session.run(`
      MATCH (user1:User {id:"${userId}"})-[:FOLLOWS]->(user2:User)-[:FOLLOWS]->(otherFriends1:User),
      (otherFriends1)-[:FOLLOWS]->(user3:User)-[:FOLLOWS]->(otherFriends2:User)
      WHERE NOT EXISTS((user1)-[:FOLLOWS]->(otherFriends2))
      RETURN otherFriends2.id AS SuggestedFriends, count(*)AS Strength
      ORDER BY Strength DESC
    `)
    return results.records.map((r) => {
      return r.get('SuggestedFriends')
    })
  }

  async suggestOtherRecipes(userId: string): Promise<any> {
    //Method to suggest other recipes liked by other friends you might follow or know
    const session = Neo4jClient.session()
    const results = await session.run(`
      MATCH (user:User {id:"${userId}"})
      WITH (user)
      CALL {
      MATCH (user)-[:FOLLOWS]->(user2:User)-[:FOLLOWS]->(user3:User), (user3)-[:FOLLOWS]->(:User)-[:LIKES]->(recipe:Recipe)
      WHERE NOT EXISTS((user)-[:LIKES]->(:Recipe))
      RETURN 'suggested' as type, recipe.id AS SuggestedRecipes, count(*) AS Strength
      UNION
      MATCH (user)-[:LIKES]->(:Recipe)<-[:LIKES]-(otherUser:User),
      (otherUser)-[:LIKES]->(otherRecipe:Recipe)
      WHERE NOT EXISTS((user)-[:LIKES]->(otherRecipe))
      RETURN 'otherSuggested' as type, otherRecipe.id AS SuggestedRecipes, count(*) AS Strength
      }
      RETURN type, SuggestedRecipes, Strength
      ORDER BY Strength DESC
    `)
    return results.records.map((r) => {
      return r.get('SuggestedRecipes')
    })
  }
  async suggestOtherRestaurants(userId: string): Promise<any> {
    //Method to suggest other Restaurants liked by other friends you might potentially follow
    const session = Neo4jClient.session()
    const results = await session.run(`
      MATCH (user:User {id:"${userId}"})
      CALL {
      MATCH (user)-[:FOLLOWS]->(user2:User)-[:FOLLOWS]->(user3:User),
      (user3)-[:FOLLOWS]->(user4:User)-[:LIKES]->(restaurant:Restaurant)
      WHERE NOT EXISTS((user)-[:LIKES]->(:Restaurant))
      RETURN 'suggested' as type, restaurant.id AS SuggestedRestaurants, count(*) AS Strength
      UNION
      MATCH (user)-[:LIKES]->(:Restaurant)<-[:LIKES]-(otherUser:User),
      (otherUser)-[:LIKES]->(otherRestaurant:Restaurant)
      WHERE NOT EXISTS((user)-[:LIKES]->(otherRestaurant))
      RETURN 'otherSuggested' as type, 
      otherRestaurant.id AS SuggestedRestaurants, count(*) AS Strength
      }
      RETURN type, SuggestedRestaurants, Strength
      ORDER BY Strength DESC
    `)
    return results.records.map((r) => {
      return r.get('SuggestedRestaurants')
    })
  }

  async suggestOtherRecipesCat(userId: string): Promise<any> {
    const session = Neo4jClient.session()
    const results = await session.run(`
        match (u:User {id:"${userId}"})
        match (u)-[:LIKES]->(r:Recipe)
        match (rec:Recipe)
        where rec.category = r.category
        return distinct rec.name as CategoryName, 
        rec.category as CategoryType limit 10
      `)
    return results.records.map((r) => {
      return r.get('CategoryName')
    })
  }
}

export default new UserService()
