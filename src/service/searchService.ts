import { RequestHandler } from 'express'

export default interface SearchService {
  post: RequestHandler
  get: RequestHandler
}
