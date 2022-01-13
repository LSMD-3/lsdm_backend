import { Neo4jRecipe, Neo4jRestaurant, Neo4jUser } from '@/interfaces'
import Neo4jClient from '@/loaders/neo4j'

class Neo4jService {

  public async addUser(userId: string): Promise<any> {
    // Method to add user
    await Neo4jClient.db.run(`CREATE (u:User {id:"${userId}"}) RETURN u`)
    return `UserID ${userId} added Successfully`
  }

  public async addRestaurant(restaurantId: string): Promise<any> {
    //Method to add Restaurant
    await Neo4jClient.db.run(`CREATE (r:Restaurant {id:"${restaurantId}"}) RETURN r`)
    return `RestaurantID ${restaurantId} added Successfully`
  }

  public async addRecipe(recipeId: string): Promise<any> {
    // Method to add Recipe
    await Neo4jClient.db.run(`CREATE (r:Recipe {id:"${recipeId}"}) RETURN r`)
    return `RecipeID ${recipeId} added Successfully`
  }

  public async userFollowUser(userId_1: string, userId_2:string): Promise<any>{
    //Method to follow another User
    await Neo4jClient.db.run(`MATCH (u1:User {id:"${userId_1}"}), (u2:User {id:"${userId_2}"}) MERGE (u1)-[r:FOLLOWS]->(u2) RETURN u1, u2`)
    return `${userId_1} now FOLLOWS ${userId_2}`
  }

  public async userLikesRestaurant(userId: string, restaurant: string): Promise<any> {
    //Method to like a Restaurant
    await Neo4jClient.db.run(`MATCH (u:User {id:"${userId}"}), (r:Restaurant {id:"${restaurant}"}) MERGE (u)-[l:LIKES]->(r) RETURN u, r`)
    return `${userId} LIKED ${restaurant}`
  }

  public async userLikesRecipe(userId: string, recipe: string): Promise<any> {
    //Method to like a Recipe by User
    await Neo4jClient.db.run(`MATCH (u:User {id:"${userId}"}), (r:Recipe {id:"${recipe}"}) MERGE (u)-[l:LIKES]->(r) RETURN u, r`)
    return `${userId} LIKED ${recipe}`
  }

  public async recipeFoundInRestaurant(recipeId:string, restaurantId: string): Promise<any>{
    //Method to add Recipe in Restaurant
    await Neo4jClient.db.run(`MATCH (rec:Recipe {id:"${recipeId}"}), (res:Restaurant {id:"${restaurantId}"}) MERGE (rec)-[f:FOUND]->(res) RETURN rec, res`)
    return `${recipeId} is now FOUND IN ${restaurantId}`
  }

  public async deleteNodes(): Promise<any>{
    //Method to delete all nodes
    await Neo4jClient.db.run(`MATCH (n) DETACH DELETE n`)
    return `All nodes deleted Successfully`
  }

  public async userUnlikesRecipe(userId: string, recipe:string): Promise<any>{
    //Method to Unlike Recipe by a User
    await Neo4jClient.db.run(`MATCH (u:User {id: '${userId}'}), (r:Recipe {id:'${recipe}'}) MATCH (u)-[l:LIKES]->(r) DELETE l`)
    return `${userId} UNLIKED ${recipe}`
  }

  public async userUnlikesRestaurant(userId: string, restaurant:string): Promise<any>{
    //Method to Unlike Restaurant by a User
    await Neo4jClient.db.run(`MATCH (u:User {id: '${userId}'}), (r:Restaurant {id:'${restaurant}'}) MATCH (u)-[l:LIKES]->(r) DELETE l`)
    return `${userId} UNLIKED ${restaurant}`
  }

  public async userUnfollowsUser(userId1: string, userId2:string): Promise<any>{
    //Method to Unfollow User
    await Neo4jClient.db.run(`MATCH (u1:User {id: '${userId1}'}), (u2:User {id:'${userId2}'}) MATCH (u1)-[f:FOLLOWS]->(u2) DELETE f`)
    return `${userId1} UNFOLLOWED ${userId2}`
  }

  public async recipeUnavailableRestaurant(recipe: string, restaurant:string): Promise<any>{
    await Neo4jClient.db.run(`MATCH (rec:Recipe {id: '${recipe}'}), (res:Restaurant {id:'${restaurant}'}) MATCH (rec)-[f:FOUND]->(res) DELETE f`)
    return `${recipe} NOT FOUND ${restaurant}`
  }

  public async searchUsers(id: string): Promise<any>{
    //Method to search for Users to follow
    const result = await Neo4jClient.db.run(`MATCH (u:Person) WHERE u.name CONTAINS "${id}" RETURN u LIMIT 10`)
    return result.records.map((r)=>{
      const user = r.get("u")
      if(user) return user.properties  
    })
  }

  public async getTotalFollows(user: string): Promise<any>{
    //Method to get count of total Users Followed
    const results = await Neo4jClient.db.run(`MATCH (u:User {id:"${user}"})<-[FOLLOWS]-()return COUNT(FOLLOWS) AS FOLLOWERS`)
    return results.records.map((r)=>{
      const followers = r.get("FOLLOWERS")
      
      return followers.low
    })
  }
}

export default new Neo4jService()