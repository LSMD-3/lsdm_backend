import { Neo4jUser } from '@/interfaces'
import Neo4jClient from '@/loaders/neo4j'

class Neo4jService {
  public async addUser(user: Neo4jUser): Promise<any> {
    // todo method to add user
    Neo4jClient.db.run('', {})
    return `User ${user.name} added`
  }
}

export default new Neo4jService()
