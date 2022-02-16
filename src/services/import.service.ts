import { IRecipe, RECIPE_PERMISSIONS } from '@/interfaces'
import { Recipe, Restaurant, User } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'
import recipeService from '@/relations-service/services/recipe.service'
import { Neo4jClient } from '@/relations-service/utils/Neo4jClient'

class ImportService {
  public async importUsersFromMongoToNeo4j() {
    // or put 100 nodes at time
    const users = await User.find({}, 'name surname email').limit(100).skip(0)

    const usersForNeo: any[] = []

    users.forEach((user) => {
      usersForNeo.push({ _id: user._id, name: user.name, surname: user.surname, email: user.email })
    })

    console.log(usersForNeo)
    // insert multiple nodes in neo4j
    const session = Neo4jClient.session()

    // put all nodes in 1 session
    await session.run(``)
  }

  public async importRecipesFromMongoToNeo4j() {
    const recipes = await Recipe.find({}, 'recipe_name image_url category ingredients').limit(100).skip(0)
    // insert multiple nodes in neo4j
    const session = Neo4jClient.session()

    await session.run(``)
  }

  public async importRestaurantsFromMongoToNeo4j() {
    const restaurants = await Restaurant.find({}, 'nome tipologia comune').limit(100).skip(0)
    // insert multiple nodes in neo4j
    const session = Neo4jClient.session()

    await session.run(``)
  }
}

export default new ImportService()
