import { Neo4jRecipe, Neo4jRestaurant, Neo4jUser } from '@/interfaces'
import { Neo4jClient } from '@/relations-service/utils/Neo4jClient'

class Neo4jService {
  public async addUser(userId: string): Promise<any> {
    // Method to add user
    const session = Neo4jClient.session()
    await session.run(`CREATE (u:User {id:"${userId}"}) RETURN u`)
    session.close()
    return `UserID ${userId} added Successfully`
  }
  public async addRestaurant(restaurantId: string): Promise<any> {
    //Method to add Restaurant
    const session = Neo4jClient.driver.session()
    await session.run(`CREATE (r:Restaurant {id:"${restaurantId}"}) RETURN r`)
    session.close()
    return `RestaurantID ${restaurantId} added Successfully`
  }
  public async addRecipe(recipeId: string): Promise<any> {
    // Method to add Recipe
    const session = Neo4jClient.driver.session()
    await session.run(`CREATE (r:Recipe {id:"${recipeId}"}) RETURN r`)
    return `RecipeID ${recipeId} added Successfully`
  }
  public async userFollowUser(userId_1: string, userId_2: string): Promise<any> {
    //Method to follow another User
    const session = Neo4jClient.driver.session()
    await session.run(`MERGE (u1:User {id:"${userId_1}"}) MERGE(u2:User {id:"${userId_2}"}) MERGE (u1)-[r:FOLLOWS]->(u2) RETURN u1, u2`)
    return `${userId_1} now FOLLOWS ${userId_2}`
  }
  public async addRestaurantIfNotExist(restaurant: string) {
    const session1 = Neo4jClient.driver.session()
    const session2 = Neo4jClient.driver.session()
    const exist = (await session1.run(`MATCH  (r:Restaurant {id:"${restaurant}"}) RETURN r`)).records.length
    if (!exist) await session2.run(`CREATE  (r:Restaurant {id:"${restaurant}"}) RETURN r`)
  }
  public async userLikesRestaurant(userId: string, restaurant: string): Promise<any> {
    //Method to like a Restaurant
    await this.addRestaurantIfNotExist(restaurant)
    const session = Neo4jClient.driver.session()
    await session.run(`MERGE (u:User {id:"${userId}"}) MERGE(r:Restaurant {id:"${restaurant}"}) MERGE (u)-[l:LIKES]->(r) RETURN u, r`)
    return `${userId} LIKED ${restaurant}`
  }
  public async userLikesRecipe(userId: string, recipe: string): Promise<any> {
    //Method to like a Recipe by User
    const session = Neo4jClient.driver.session()
    await session.run(`MERGE (u:User {id:"${userId}"}) MERGE(r:Recipe {id:"${recipe}"}) MERGE (u)-[l:LIKES]->(r) RETURN u, r`)
    return `${userId} LIKED ${recipe}`
  }
  public async recipeFoundInRestaurant(recipeId: string, restaurantId: string): Promise<any> {
    //Method to add Recipe in Restaurant
    const session = Neo4jClient.driver.session()
    await session.run(
      `MATCH (rec:Recipe {id:"${recipeId}"}), (res:Restaurant {id:"${restaurantId}"}) MERGE (rec)-[f:FOUND]->(res) RETURN rec, res`
    )
    return `${recipeId} is now FOUND IN ${restaurantId}`
  }
  public async deleteNodes(): Promise<any> {
    //Method to delete all nodes
    const session = Neo4jClient.driver.session()
    await session.run(`MATCH (n) DETACH DELETE n`)
    return `All nodes deleted Successfully`
  }
  public async userUnlikesRecipe(userId: string, recipe: string): Promise<any> {
    //Method to Unlike Recipe by a User
    const session = Neo4jClient.driver.session()
    await session.run(`MATCH (u:User {id: '${userId}'}), (r:Recipe {id:'${recipe}'}) MATCH (u)-[l:LIKES]->(r) DELETE l`)
    return `${userId} UNLIKED ${recipe}`
  }
  public async userUnlikesRestaurant(userId: string, restaurant: string): Promise<any> {
    //Method to Unlike Restaurant by a User
    const session = Neo4jClient.driver.session()
    await session.run(`MATCH (u:User {id: '${userId}'}), (r:Restaurant {id:'${restaurant}'}) MATCH (u)-[l:LIKES]->(r) DELETE l`)
    return `${userId} UNLIKED ${restaurant}`
  }
  public async userUnfollowsUser(userId1: string, userId2: string): Promise<any> {
    //Method to Unfollow User
    const session = Neo4jClient.driver.session()
    await session.run(`MATCH (u1:User {id: '${userId1}'}), (u2:User {id:'${userId2}'}) MATCH (u1)-[f:FOLLOWS]->(u2) DELETE f`)
    return `${userId1} UNFOLLOWED ${userId2}`
  }
  public async recipeUnavailableRestaurant(recipe: string, restaurant: string): Promise<any> {
    const session = Neo4jClient.driver.session()
    await session.run(`MATCH (rec:Recipe {id: '${recipe}'}), (res:Restaurant {id:'${restaurant}'}) MATCH (rec)-[f:FOUND]->(res) DELETE f`)
    return `${recipe} NOT FOUND ${restaurant}`
  }
  public async searchUsers(id: string): Promise<any> {
    //Method to search for Users to follow
    const session = Neo4jClient.driver.session()
    const result = await session.run(`MATCH (u:Person) WHERE u.name CONTAINS "${id}" RETURN u LIMIT 10`)
    return result.records.map((r) => {
      const user = r.get('u')
      if (user) return user.properties
    })
  }
  public async getTotalFollowers(user: string): Promise<any> {
    //Method to get count of total Users Followed
    const session = Neo4jClient.driver.session()
    const results = await session.run(`MATCH (u:User {id:"${user}"})<-[FOLLOWS]-()return COUNT(FOLLOWS) AS FOLLOWERS`)
    return results.records.map((r) => {
      const followers = r.get('FOLLOWERS')
      return followers.low
    })
  }
  public async getFollowers(user: string): Promise<any> {
    //Method to get count of total Users Followed
    const session = Neo4jClient.driver.session()
    const results = await session.run(`MATCH (u:User {id:"${user}"})<-[FOLLOWS]-(u2:User)return  u2`)
    return results.records.map((r) => {
      const followers = r.get('u2')
      return followers.properties
    })
  }
  public async getTotalFollows(user: string): Promise<any> {
    //Method to get count of total Users Followed
    const session = Neo4jClient.driver.session()
    const results = await session.run(`MATCH (u:User {id:"${user}"})-[FOLLOWS]->()return COUNT(FOLLOWS) AS FOLLOWERS`)
    return results.records.map((r) => {
      const followers = r.get('FOLLOWERS')
      return followers.low
    })
  }
  public async getTotalFollowsID(userId: string): Promise<any> {
    //Method to get the ID of those you are following
    const session = Neo4jClient.driver.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})-[FOLLOWS]->(u2:User) return u2`)
    return results.records.map((f) => {
      const followIds = f.get('u2')
      return followIds.properties.id
    })
  }
  public async getLikedRestaurants(userId: string) {
    const session = Neo4jClient.driver.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})-[LIKES]->(r:Restaurant)return r`)
    return results.records.map((f) => {
      const followIds = f.get('r')
      return followIds.properties.id
    })
  }
  public async getLikedRecipes(userId: string) {
    const session = Neo4jClient.driver.session()
    const results = await session.run(`MATCH (u:User {id:"${userId}"})-[LIKES]->(r:Recipe)return r`)
    return results.records.map((f) => {
      const followIds = f.get('r')
      return followIds.properties.id
    })
  }
  public async suggestOtherFriends(userId: string): Promise<any> {
    //Method that suggest other friends to follow based on friends you are following
    const session = Neo4jClient.driver.session()
    const results = await session.run(`MATCH (user1:User {id:"${userId}"})-[:FOLLOWS]->(user2:User)-[:FOLLOWS]->(otherFriends1:User),
    (otherFriends1)-[:FOLLOWS]->(user3:User)-[:FOLLOWS]->(otherFriends2:User) RETURN otherFriends2.id AS SuggestedFriends, count(*)AS Strength
    ORDER BY Strength DESC`)
    return results.records.map((r) => {
      return r.get('SuggestedFriends')
    })
  }
  public async suggestOtherRecipes(userId: string): Promise<any> {
    //Method to suggest other recipes liked by other friends you might follow or know
    const session = Neo4jClient.driver.session()
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
  public async suggestOtherRestaurants(userId: string): Promise<any> {
    //Method to suggest other Restaurants liked by other friends you might potentially follow
    const session = Neo4jClient.driver.session()
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

export default new Neo4jService()
