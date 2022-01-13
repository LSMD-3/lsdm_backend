import { IRestaurant } from '@/interfaces'
import mongoose, { Schema } from 'mongoose'
import { mongoConnections } from '@/loaders/mongoose'

var Restaurant = new Schema(
  {
    nome: { type: String, required: true },
    img_url: { type: String },
    descrizione: { type: String },
    tipologia: { type: String },
    comune: { type: String },
    via: { type: String },
    telefono: { type: String },
    email: { type: String },
    web: { type: String },
    latitudine: { type: String },
    longitudine: { type: String },
    provincia: { type: String },
    cap: { type: String },
    chefs: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    waiters: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    admins: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    menu: {
      _id: false,
      ayce_available: { type: Boolean },
      name: { type: String },
      recipes: [
        {
          _id: false,
          recipe: { type: Schema.Types.ObjectId, ref: 'recipes' },
          price: { type: Number, required: true },
          max_quantity: { type: Number },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoConnections['main'].model<IRestaurant>('restaurants', Restaurant)
