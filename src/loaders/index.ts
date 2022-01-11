import expressLoader from './express'

export default async ({ expressApp }: any) => {
  expressLoader({ app: expressApp })
}
