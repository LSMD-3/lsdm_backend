import { DomainError, NOT_ALLOWED_CODE, NOT_FOUND_CODE } from '@/exceptions'
import { IUser, USER_PERMISSIONS } from '@/interfaces'
import { User } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'

class UserService extends AbstractService<IUser> {
  public getEntityManager = () => User
  public getPermissions = () => USER_PERMISSIONS
  public projectFieldsSearch = (type: ProjectType) => {
    if (type === 'base') return 'all'
    return '_id'
  }

  public blackListUpdateFields = { logins: 1 }

  public async getEmailByIds(ids: string[]) {
    const emails = await User.find({ _id: { $in: ids } }, 'email')
    return emails
  }

  public async invalidateSessions(id: string, date: Date) {
    let user = await this.getEntityManager().findById(id)
    if (!user) throw new DomainError('', 404, NOT_FOUND_CODE.ENTITY_NOT_FOUND, 'User not found', 'User not found')
    user.ignoreTokensBefore = date ?? new Date()
    await user.save()
  }
}

export default new UserService()
