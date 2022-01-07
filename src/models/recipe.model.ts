import { IRecipe } from '@/interfaces'
import mongoose, { Schema } from 'mongoose'
import { mongoConnections } from '@/loaders/mongoose'

var Recipe = new Schema(
  {
    recipe_name: { type: String, required: true },
    recipe_link: { type: String, required: true },
    image_url: { type: String },
    category: { type: String },
    ingredients: [{ type: JSON }],
  },
  {
    timestamps: true,
  }
)

export default mongoConnections['main'].model<IRecipe>('recipes', Recipe)
