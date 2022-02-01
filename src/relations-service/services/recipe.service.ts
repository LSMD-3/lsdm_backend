import { BaseNeo4jService } from './baseNeo4j.service'

export interface RecipeNodeProps {
  _id: string
  name: string
}

class RecipeService extends BaseNeo4jService<RecipeNodeProps> {
  constructor() {
    super('Recipe', [{ to: 'Ingredient', relations: ['HAS'] }])
  }
}

export default new RecipeService()
