import { Neo4jClient } from '../utils/Neo4jClient'
import { BaseNeo4jService } from './baseNeo4j.service'

export interface UserNodeProps {
  _id: string
  email: string
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

  async getFavouritesIngredients(userId: string) {
    const getEaten = async () => {
      const session = Neo4jClient.session()
      const results = await session.run(`match (u:User {_id:"${userId}"})-[:EATS]->(r:Recipe)-[:HAS]->(eaten:Ingredient) return eaten`)
      session.close()
      return results.records.map((f) => {
        const followIds = f.get('eaten')
        return followIds.properties
      }) as { name: string; _id: string }[]
    }
    const getLiked = async () => {
      const session = Neo4jClient.session()
      const results = await session.run(`match (u:User {_id:"${userId}"})-[:LIKES]->(r:Recipe)-[:HAS]->(liked:Ingredient) return liked`)
      session.close()
      return results.records.map((f) => {
        const followIds = f.get('liked')
        return followIds.properties
      })
    }
    const [eaten, liked] = await Promise.all([getEaten(), getLiked()])

    // Join eaten and liked
    let dict: { [ingredientId: string]: number } = {}
    eaten.forEach((i) => {
      if (dict.hasOwnProperty(i._id)) {
        dict[i._id]++
      } else {
        dict[i._id] = 1
      }
    })

    liked.forEach((i) => {
      if (dict.hasOwnProperty(i._id)) {
        dict[i._id] += 5
      } else {
        dict[i._id] = 5
      }
    })

    return dict
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
    const results = await session.run(`MATCH (user1:User {id:"${userId}"})-[:FOLLOWS]->(user2:User)-[:FOLLOWS]->(otherFriends1:User),
    (otherFriends1)-[:FOLLOWS]->(user3:User)-[:FOLLOWS]->(otherFriends2:User) RETURN otherFriends2.id AS SuggestedFriends, count(*)AS Strength
    ORDER BY Strength DESC`)
    return results.records.map((r) => {
      return r.get('SuggestedFriends')
    })
  }

  async suggestOtherRecipes(userId: string): Promise<any> {
    //Method to suggest other recipes liked by other friends you might follow or know
    const session = Neo4jClient.session()
    const results = await session.run(`MATCH (user:User {id:"${userId}"})
    WITH (user)
    CALL {
    MATCH (user)-[:FOLLOWS]->(user2:User)-[:FOLLOWS]->(user3:User), (user3)-[:FOLLOWS]->(:User)-[:LIKES]->(recipe:Recipe)
    RETURN 'suggested' as type, recipe.id AS SuggestedRecipes, count(*) AS Strength
    UNION
    MATCH (user)-[:LIKES]->(:Recipe)<-[:LIKES]-(otherUser:User),
    (otherUser)-[:LIKES]->(otherRecipe:Recipe)
    RETURN 'otherSuggested' as type, otherRecipe.id AS SuggestedRecipes, count(*) AS Strength
    }
    RETURN type, SuggestedRecipes, Strength
    ORDER BY Strength DESC`)
    return results.records.map((r) => {
      return r.get('SuggestedRecipes')
    })
  }
  async suggestOtherRestaurants(userId: string): Promise<any> {
    //Method to suggest other Restaurants liked by other friends you might potentially follow
    const session = Neo4jClient.session()
    const results = await session.run(`MATCH (user:User {id:"${userId}"})
    WITH (user)
    CALL {
    MATCH (user)-[:FOLLOWS]->(user2:User)-[:FOLLOWS]->(user3:User), (user3)-[:FOLLOWS]->(:User)-[:LIKES]->(restaurant:Restaurant)
    RETURN 'suggested' as type, restaurant.id AS SuggestedRestaurants, count(*) AS Strength
    UNION
    MATCH (user)-[:LIKES]->(:Restaurant)<-[:LIKES]-(otherUser:User),
    (otherUser)-[:LIKES]->(otherRestaurant:Restaurant)
    RETURN 'otherSuggested' as type, otherRestaurant.id AS SuggestedRestaurants, count(*) AS Strength
    }
    RETURN type, SuggestedRestaurants, Strength
    ORDER BY Strength DESC`)
    return results.records.map((r) => {
      return r.get('SuggestedRestaurants')
    })
  }
}

export default new UserService()