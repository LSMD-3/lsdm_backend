import { ITableSession } from '@/interfaces'
import mongoose, { Schema } from 'mongoose'
import { mongoConnections } from '@/loaders/mongoose'

var TableSession = new Schema(
  {
    restaurantId: { type: String, required: true },
    tableId: { type: String, required: true },
    partecipants: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    orders: [
      {
        _id: false,
        clientId: { type: Schema.Types.ObjectId, ref: 'users' },
        recipeId: { type: Schema.Types.ObjectId, ref: 'recipes' },
        quantity: { type: Number, required: true },
        orderNumber: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoConnections['main'].model<ITableSession>('tableSession', TableSession)
