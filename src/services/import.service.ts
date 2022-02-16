import { IRecipe, RECIPE_PERMISSIONS } from '@/interfaces'
import { Recipe, Restaurant, User } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'
import recipeService from '@/relations-service/services/recipe.service'
import { Neo4jClient } from '@/relations-service/utils/Neo4jClient'
import stringifyAttributes from '../utils/parsers'

class ImportService {
  public async importUsersFromMongoToNeo4j() {
    // or put 100 nodes at time
    // const users = await User.find({}, 'name surname email').limit(100).skip(0)
    const users = await User.find({}, 'name surname email')

    const usersForNeo: any[] = []

    users.forEach((user) => {
      usersForNeo.push({ _id: user._id, name: user.name, surname: user.surname, email: user.email })
    })
    // insert multiple nodes in neo4j
    for(let i = 0; i < usersForNeo.length; i++) {
      const user = usersForNeo[i]
      const session = Neo4jClient.session()
      try{

        const tx = session.beginTransaction()
        await tx.run(`MERGE (u:Users {id:"${user._id}", name:"${user.name}", surname:"${user.surname}", email:"${user.email }"}) RETURN u`)
        await tx.commit()
        console.log('User %d inserted', i)
      }
      finally{
        await session.close()
      }
    }
  }

  public async importRecipesFromMongoToNeo4j() {
    const recipes = await Recipe.find({}, 'recipe_name image_url category ingredients')
    
    const recipesForNeo: any[] = []

    recipes.forEach((recipe) => {
      recipesForNeo.push({ _id: recipe._id, name: recipe.recipe_name, image: recipe.image_url, category: recipe.category, ingredients: recipe.ingredients })
    })
    // insert multiple nodes in neo4j
    for(let i = 0; i < recipesForNeo.length; i++) {
      const recipe = recipesForNeo[i]
      const session = Neo4jClient.session()
      try{

        const tx = session.beginTransaction()
        await tx.run(`MERGE (r:Recipes {id:"${recipe._id}", name:"${recipe.name}", image:"${recipe.image}", category:"${recipe.category}", ingredients:"${recipe.ingredients}"}) RETURN r`)
        await tx.commit()
        console.log('Recipe %d Inserted', i)
      }
      finally{
        await session.close()
      }
    }
    
  }

  public async importRestaurantsFromMongoToNeo4j() {
    const restaurants = await Restaurant.find({}, 'nome tipologia comune')
    

    const restaurantsForNeo: any[] = []

    restaurants.forEach((restaurant) => {
      restaurantsForNeo.push({ _id: restaurant._id, name: restaurant.nome.replace(/["]+/g, ''), type: restaurant.tipologia, comune: restaurant.comune })
    })
    // insert multiple nodes in neo4j
    for(let i = 0; i < restaurantsForNeo.length; i++) {
      const restaurant = restaurantsForNeo[i]
      const session = Neo4jClient.session()
      try{

        const tx = session.beginTransaction()
        await tx.run(`MERGE (u:Restaurants {id:"${restaurant._id}", name:replace("${restaurant.name}",'"', ''), type:"${restaurant.type}", comune:"${restaurant.comune}"}) RETURN u`)
        await tx.commit()
        console.log('Restaurant %d Inserted', i)
      }
      finally{
        await session.close()
      }
    }
    
  }
}

export default new ImportService()
