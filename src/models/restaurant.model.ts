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

    tables_number: { type: Number, default: 10 },
    staff: {
      _id: false,
      chefs: [{ type: JSON }],
      waiters: [{ type: JSON }],
      admins: [{ type: JSON }],
    },
    menus: [
      {
        ayce: { type: Boolean },
        name: { type: String },
        recipes: [{ type: JSON }],
        price: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoConnections['main'].model<IRestaurant>('restaurants', Restaurant)
