import { BaseNeo4jService } from './baseNeo4j.service'

export interface RecipeNodeProps {
  id: string
  name: string
  category?: string
  image_url?: string
}

class RecipeService extends BaseNeo4jService<RecipeNodeProps> {
  constructor() {
    super('Recipes', [])
  }
}

export default new RecipeService()
