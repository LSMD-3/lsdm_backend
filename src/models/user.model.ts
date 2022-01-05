import { IUser } from '@/interfaces'
import { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import { mongoConnections } from '@/loaders/mongoose'

var User = new Schema(
  {
    name: { type: String },
    surname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    master: { type: Boolean, default: false },
    logins: { type: [Date], default: [] },
    locked: { type: Boolean, default: false },
    ignoreTokensBefore: { type: Date }, //Used to invalidate sessions
  },
  {
    timestamps: true,
  }
)

User.pre('save', async function save(next: any) {
  try {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (e) {
    return next(e)
  }
})

User.virtual('role', { ref: 'Role', localField: 'roleId', foreignField: '_id', justOne: true })

User.methods.validatePassword = async function validatePassword(password: string) {
  return bcrypt.compare(password, this.password)
}

export default mongoConnections['main'].model<IUser>('User', User)
