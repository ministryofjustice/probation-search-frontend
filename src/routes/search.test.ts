import probationSearchRoutes from './search'
import { Request, Response, Router } from 'express'

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
let handleGet: (req: Request, res: Response) => any
let handlePost: (req: Request, res: Response) => any

const environment = 'local'
const oauthClient = { getSystemClientToken: jest.fn() }
const router = {
  get: (path: string, handler: (req: Request, res: Response) => any) => (handleGet = handler),
  post: (path: string, handler: (req: Request, res: Response) => any) => (handlePost = handler),
} as any as Router

beforeEach(() => {
  req = request({})
  res = {
    render: jest.fn(),
    redirect: jest.fn(),
    locals: {},
  } as unknown as Response

  probationSearchRoutes({ environment, oauthClient, router })
})

describe('POST /search', () => {
  test('stores the query and reloads the page', () => {
    req = request({ 'probation-search-input': 'test' })

    handlePost(req, res)

    expect(req.session.probationSearch?.query).toEqual('test')
    expect(res.redirect).toHaveBeenCalledWith('http://localhost/search')
  })
})

describe('GET /search', () => {
  test('renders an empty screen when no session', () => {
    handleGet(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search', { probationSearchResults: {} })
  })

  test('renders an error message if query is undefined', () => {
    req.session.probationSearch = {}

    handleGet(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search', {
      probationSearchResults: { errorMessage: { text: 'Please enter a search term' }, query: '' },
    })
  })

  test('renders an error message if query is empty string', () => {
    req.session.probationSearch = { query: '' }

    handleGet(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search', {
      probationSearchResults: { errorMessage: { text: 'Please enter a search term' }, query: '' },
    })
  })

  it('renders an error message when query is too long', () => {
    req.session.probationSearch = { query: '12345' }
    probationSearchRoutes({ environment, oauthClient, router, maxQueryLength: 4 })

    handleGet(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search', {
      probationSearchResults: { errorMessage: { text: 'Query must be 4 characters or less.' }, query: '12345' },
    })
  })

  test('renders empty search screen for empty query when allowEmptyQuery is true', () => {
    probationSearchRoutes({ environment, oauthClient, router, allowEmptyQuery: true })

    handleGet(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search', { probationSearchResults: {} })
  })

  test('passes through extra template fields', () => {
    const templateFields = () => ({ field1: 'value1', field2: 'value2' })
    probationSearchRoutes({ environment, oauthClient, router, templateFields })

    handleGet(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search', {
      probationSearchResults: {},
      field1: 'value1',
      field2: 'value2',
    })
  })
})
