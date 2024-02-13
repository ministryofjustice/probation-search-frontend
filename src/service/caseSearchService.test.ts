import { NextFunction, Request, Response } from 'express'
import CaseSearchService from './caseSearchService'

const request = (body: any, query: { [key: string]: string } = {}, session: any = {}) =>
  ({
    body,
    query,
    session,
    protocol: 'http',
    get: () => 'localhost',
    originalUrl: '/search',
    url: '/search',
  }) as unknown as Request

let req: Request
let res: Response
let next: NextFunction

const environment = 'local'
let service: CaseSearchService

beforeEach(() => {
  req = request({})
  res = {
    render: jest.fn(),
    redirect: jest.fn(),
    locals: {},
  } as unknown as Response
  next = () => {}

  service = new CaseSearchService({ environment })
})

describe('POST /search', () => {
  test('stores the query and reloads the page', () => {
    req = request({ 'probation-search-input': 'test' })

    service.post(req, res, next)

    expect(req.session.probationSearch?.query).toEqual('test')
    expect(res.redirect).toHaveBeenCalledWith('http://localhost/search')
  })
})

describe('GET /search', () => {
  test('renders an empty screen when no session', () => {
    service.get(req, res, next)

    expect(res.locals.searchResults).toEqual({})
  })

  test('renders an error message if query is undefined', () => {
    req.session.probationSearch = {}

    service.get(req, res, next)

    expect(res.locals.searchResults).toEqual({ errorMessage: { text: 'Please enter a search term' }, query: '' })
  })

  test('renders an error message if query is empty string', () => {
    req.session.probationSearch = { query: '' }

    service.get(req, res, next)

    expect(res.locals.searchResults).toEqual({ errorMessage: { text: 'Please enter a search term' }, query: '' })
  })

  it('renders an error message when query is too long', () => {
    req.session.probationSearch = { query: '12345' }

    new CaseSearchService({ environment, maxQueryLength: 4 }).get(req, res, next)

    expect(res.locals.searchResults).toEqual({
      errorMessage: { text: 'Query must be 4 characters or less.' },
      query: '12345',
    })
  })

  test('renders empty search screen for empty query when allowEmptyQuery is true', () => {
    new CaseSearchService({ environment, allowEmptyQuery: true }).get(req, res, next)

    expect(res.locals.searchResults).toEqual({})
  })
})
