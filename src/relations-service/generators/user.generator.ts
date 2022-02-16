import { Neo4jClient } from '../utils/Neo4jClient'

class UserGenerator {
  async generateRandomUserFollows(userId: string, n: number) {
    // TODO
    const session = Neo4jClient.session()
    await session.run(`
  
  WITH ${n} as followRange
      MATCH (u:Users)
      WITH collect(u) as allusers, followRange
      MATCH (u2:Users) WHERE u2.id = "${userId}"
      WITH u2, apoc.coll.randomItems(allusers, followRange) as allusers
      FOREACH (user in allusers | CREATE (user)-[:FOLLOWS]->(u2))
  `)
    session.close()
    return `${n} follow relationships generated for ${userId}`
  }

  generateInfluencerUserFollows(userId: string, n: number) {
    // userId of influencer
    // n -> number of follower to add
  }

  async generateRandomRestaurantLike(userId: string, n: number) {
    // TODO
    const session = Neo4jClient.session()
    await session.run(`
  
  WITH ${n} as likeRange
      MATCH (r:Restaurants)
      WITH collect(r) as allrestaurants, likeRange
      MATCH (u2:Users) WHERE u2.id = "${userId}"
      WITH u2, apoc.coll.randomItems(allrestaurants, likeRange) as allrestaurants
      FOREACH (restaurant in allrestaurants | CREATE (u2)-[:LIKES]->(restaurant))
  `)
    session.close()
    return `${n} liked relationships generated for ${userId}`
  }

  async generateRandomRecipeLike(userId: string, n: number) {
    // TODO
    const session = Neo4jClient.session()
    await session.run(`
  
  WITH ${n} as likeRange
      MATCH (r:Recipes)
      WITH collect(r) as allrecipes, likeRange
      MATCH (u2:Users) WHERE u2.id = "${userId}"
      WITH u2, apoc.coll.randomItems(allrecipes, likeRange) as allrecipes
      FOREACH (recipe in allrecipes | CREATE (u2)-[:LIKES]->(recipe))
  `)
    session.close()
    return `${n} liked relationships generated for ${userId}`
  }
}

export default new UserGenerator()
