import { Neo4jClient } from '../utils/Neo4jClient'
import stringifyAttributes from '../utils/parsers'

export type Neo4jEntity = 'User' | 'Restaurant' | 'Recipes'
export type Neo4jRelation = 'LIKES' | 'FOLLOWS' | 'HAS' | 'EATS'

interface BaseNode {
  id: string
}

interface AllowedRelation {
  to: Neo4jEntity
  relations: Neo4jRelation[]
}

export class BaseNeo4jService<NodeAttributes extends BaseNode> {
  private entityName
  private allowedRelations
  constructor(entityName: Neo4jEntity, allowedRelations: AllowedRelation[]) {
    this.entityName = entityName
    this.allowedRelations = allowedRelations
  }

  private isOperationAllowed(destinationEntity: Neo4jEntity, relation: Neo4jRelation) {
    const entity = this.allowedRelations.find((e) => e.to == destinationEntity)
    if (!entity) return false
    return entity.relations.includes(relation)
  }

  async createNode(attributes: NodeAttributes) {
    const session = Neo4jClient.session()
    await session.run(
      `MERGE (r:${this.entityName} ${stringifyAttributes(attributes)}) 
       RETURN r`
    )
    session.close()
  }

  async deleteNode(id: string) {
    const session = Neo4jClient.session()
    await session.run(
      `MATCH (r:${this.entityName} {id:"${id}"}) 
       DETACH DELETE r`
    )
    session.close()
  }

  async deleteAllNodes() {
    const session = Neo4jClient.session()
    await session.run(
      `MATCH (r:${this.entityName}) 
      DETACH DELETE r`
    )
    session.close()
  }

  async createRelation(from: string, relation: Neo4jRelation, to: string, destinationEntity: Neo4jEntity, attributes?: any) {
    if (!this.isOperationAllowed(destinationEntity, relation)) return
    const session = Neo4jClient.session()
    await session.run(
      `MATCH (from:${this.entityName} {id:"${from}"}), (to:${destinationEntity} {id:"${to}"}) 
       MERGE (from)-[f:${relation}]->(to) 
       RETURN from, to`
    )
    session.close()
  }

  // private chunkArray(input: string[], chunkSize = 10) {
  //   const chunked: string[][] = []
  //   Array.from({ length: Math.ceil(input.length / chunkSize) }, (val, i) => {
  //     chunked.push(input.slice(i * chunkSize, i * chunkSize + chunkSize))
  //   })
  //   return chunked
  // }

  async createMultipleRelation(from: string, relation: Neo4jRelation, tos: string[], destinationEntity: Neo4jEntity, attributes?: any) {
    if (!this.isOperationAllowed(destinationEntity, relation)) return

    for (let i = 0; i < tos.length; i++) {
      try {
        await this.createRelation(from, relation, tos[i], destinationEntity)
      } catch (error) {
        console.log(error)
        throw new Error('failed')
      }
    }
    return 'success'
  }

  async deleteMultipleRelation(from: string, relation: Neo4jRelation, tos: string[], destinationEntity: Neo4jEntity, attributes?: any) {
    if (!this.isOperationAllowed(destinationEntity, relation)) return

    for (let i = 0; i < tos.length; i++) {
      try {
        await this.deleteRelation(from, relation, tos[i], destinationEntity)
      } catch (error) {
        console.log(error)
        throw new Error('failed')
      }
    }
    return 'success'
  }

  async deleteRelation(from: string, relation: Neo4jRelation, to: string, destinationEntity: Neo4jEntity) {
    if (!this.isOperationAllowed(destinationEntity, relation)) return
    const session = Neo4jClient.session()
    await session.run(
      `MATCH (from:${this.entityName} {id: '${from}'}), (to:${destinationEntity} {id:'${to}'}) MATCH (from)-[relation:${relation}]->(to) DELETE relation`
    )
    session.close()
  }

  async deleteAllRelations(id: string, relation: Neo4jRelation) {
    const session = Neo4jClient.session()
    await session.run(`
      MATCH (n {id: "${id}"})-[r:${relation}]->() 
      DELETE r
    `)
    session.close()
  }
}
