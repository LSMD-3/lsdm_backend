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
  },
  {
    timestamps: true,
  }
)

export default mongoConnections['main'].model<IRestaurant>('restaurants', Restaurant)
