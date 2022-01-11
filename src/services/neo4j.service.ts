import { Neo4jRecipe, Neo4jRestaurant, Neo4jUser } from '@/interfaces'
import Neo4jClient from '@/loaders/neo4j'

class Neo4jService {

  public async addUser(userId: string): Promise<any> {
    // Method to add user
    Neo4jClient.db.run('CREATE (u:User {id:$id}) RETURN u', {idParam: userId})

    return `UserID ${userId} added Successfully`
  }

  public async addRestaurant(restaurantId: string): Promise<any> {
    //Method to add Restaurant
    Neo4jClient.db.run(`CREATE (r:Restaurant {id:$id}) RETURN r`, {idParam: restaurantId})
    
    return `RestaurantID ${restaurantId} added Successfully`
  }

  public async addRecipe(recipeId: string): Promise<any> {
    // Method to add Recipe
    Neo4jClient.db.run('CREATE (r:Recipe {id:$id}) RETURN r', {idParam: recipeId})
    return `RecipeID ${recipeId} added Successfully`
  }

  public async userFollowUser(userId_1: string, userId_2:string): Promise<any>{
    //Method to follow another User
    Neo4jClient.db.run('MATCH (user1:User), (user2:User) MERGE (user1)-[r:FOLLOWS]->(user2) RETURN DISTINCT user1, user2', {idParam: userId_1, idParam2:userId_2})
    return `${userId_1} now FOLLOWS ${userId_2}`
  }

  public async userLikesRestaurant(userId: string, restaurant: string): Promise<any> {
    //Method to like a Restaurant
    Neo4jClient.db.run('MATCH (user:User), (restaurant:Restaurants) MERGE (user)-[r:LIKES]->(restaurant) RETURN DISTINCT user, restaurant', {userParam: userId, restaurantParam:restaurant})
    return `${userId} LIKED ${restaurant}`
  }

  public async recipeFoundInRestaurant(recipeId:string, restaurantId: string): Promise<any>{
    //Method to add Recipe in Restaurant
    Neo4jClient.db.run('MATCH (recipe:Recipes), (restaurant:Restaurants) MERGE (recipe)-[r:FOUND_IN]->(restaurant) RETURN DISTINCT recipess,restaurant', {recipeParam: recipeId, restaurantParam:restaurantId})
    return `${recipeId} is FOUND_IN ${restaurantId}`
  }

  public async deleteNodes(): Promise<any>{
    //Method to delete all nodes
    Neo4jClient.db.run('MATCH (n) DETACH DELETE n')
    return `All nodes deleted Successfully`
  }
}

export default new Neo4jService()