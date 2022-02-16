import { DomainError, NOT_AUTHORIZED_CODE, NOT_FOUND_CODE } from '@/exceptions'
import { IUser } from '@/interfaces'
import { User } from '@/models'
import config from '@/config'
import jwt, { VerifyOptions } from 'jsonwebtoken'
import userService from '@/relations-service/services/user.service'

const ISSUER = 'node-express-mongo-boilerplate'
export interface JwtUserTokenValues {
  iss: string
  email: string
  sudo: boolean
  id: string
  permissions?: string[]
  exp?: number
  iat?: number
}

export interface RefreshJwtUserTokenValues {
  iss: string
  email: string
  id: string
}

class AuthService {
  public async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      let user = await User.findOne({ email })
      if (!user)
        throw new DomainError(
          '',
          400,
          NOT_FOUND_CODE.ENTITY_NOT_FOUND,
          'Email not valid',
          'The email you provided is not associated to an account.'
        )
      if (!user?.validatePassword(password))
        throw new DomainError(
          '',
          401,
          NOT_AUTHORIZED_CODE.INVALID_CREDENTIALS,
          'Password not valid',
          'The password you provided does not match.'
        )

      const userTokens = this.generateJWT(user)
      user.logins.push(new Date())
      await user.save()
      return userTokens
    } catch (e) {
      throw e
    }
  }

  public async signup(
    email: string,
    password: string,
    name: string,
    surname: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      let existUser = await User.findOne({ email })
      if (existUser)
        throw new DomainError(
          '',
          400,
          NOT_FOUND_CODE.ENTITY_NOT_FOUND,
          'Email not valid',
          'The email you provided is associated to an account.'
        )

      const user = await User.create({ email, password, name, surname })
      const userTokens = this.generateJWT(user)
      user.logins.push(new Date())
      await user.save()
      try {
        await userService.createNode({ id: user._id, email: user.email, name: user.name, surname: user.surname })
      } catch (error) {
        await User.findOneAndDelete({ _id: user._id })
        throw new Error('Failed to add user in neo4j')
      }
      return userTokens
    } catch (e) {
      throw e
    }
  }

  private generateJWT(user: IUser): { accessToken: string; refreshToken: string } {
    try {
      const accessToken = jwt.sign(this.getUserJwtValues(user), config.jwtSecret as string, {
        algorithm: 'HS256',
        expiresIn: config.jwtExpirationTime,
      })
      const refreshToken = jwt.sign(this.getRefreshTokenValues(user), config.jwtSecret as string, {
        algorithm: 'HS256',
        expiresIn: config.refreshTokenExpiration,
      })
      return { accessToken, refreshToken }
    } catch (e) {
      throw e
    }
  }

  private getUserJwtValues(user: IUser): JwtUserTokenValues {
    return { email: user.email, iss: ISSUER, permissions: [], sudo: false, id: user._id }
  }

  private getRefreshTokenValues(user: IUser): RefreshJwtUserTokenValues {
    return { email: user.email, iss: ISSUER, id: user._id }
  }

  public async verifyAuthToken(authToken: string | undefined): Promise<IUser> {
    if (!authToken) throw new DomainError('', 401, NOT_AUTHORIZED_CODE.MISSING_CREDENTIALS, 'Credentials are missing')
    if (authToken.startsWith('Bearer ')) authToken = authToken.substring(7, authToken.length)
    let tokenValues: JwtUserTokenValues
    const jwtOptions: VerifyOptions = {
      algorithms: ['HS256'],
      issuer: ISSUER,
    }
    try {
      tokenValues = jwt.verify(authToken, config.jwtSecret as string, jwtOptions) as JwtUserTokenValues
    } catch (e) {
      throw new DomainError('', 401, NOT_AUTHORIZED_CODE.TOKEN_INVALID, 'Token is expired or invalid')
    }
    if (!tokenValues || !tokenValues.id) throw new DomainError('', 401, NOT_AUTHORIZED_CODE.TOKEN_INVALID, 'Token is expired or invalid')
    const user = await User.findById(tokenValues.id)
    return user!
  }

  private async verifyRefreshToken(refreshToken: string): Promise<IUser> {
    if (!refreshToken) throw new DomainError('', 401, NOT_AUTHORIZED_CODE.MISSING_CREDENTIALS, 'Credentials are missing')
    let tokenValues: RefreshJwtUserTokenValues
    const jwtOptions: VerifyOptions = {
      algorithms: ['HS256'],
      issuer: ISSUER,
    }
    try {
      tokenValues = jwt.verify(refreshToken, config.refreshJwtSecret as string, jwtOptions) as RefreshJwtUserTokenValues
    } catch (e) {
      throw new DomainError('', 401, NOT_AUTHORIZED_CODE.TOKEN_INVALID, 'Token is expired or invalid')
    }
    if (!tokenValues || !tokenValues.id) throw new DomainError('', 401, NOT_AUTHORIZED_CODE.TOKEN_INVALID, 'Token is expired or invalid')
    const user = await User.findById(tokenValues.id)
    return user!
  }

  public async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      let user = await this.verifyRefreshToken(refreshToken)
      return this.generateJWT(user)
    } catch (e) {
      throw e
    }
  }
}

export default new AuthService()
