import { BaseNeo4jService } from './baseNeo4j.service'

export interface RecipeNodeProps {
  _id: string
  name: string
}

class RecipeService extends BaseNeo4jService<RecipeNodeProps> {
  constructor() {
    super('Ingredient', [])
  }
}

export default new RecipeService()