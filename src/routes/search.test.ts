import { redirectToResults, renderResults } from './search'
import { Request, Response } from 'express'
import ProbationSearchClient from '../data/probationSearchClient'

const request = (body: any, query: { [key: string]: string } = {}) =>
  ({ body, protocol: 'http', get: () => 'localhost', originalUrl: '/search', query }) as unknown as Request
const template = 'search'
const templateFields = () => ({})

const client = {
  search: jest.fn(),
} as any as ProbationSearchClient

let req: Request
let res: Response

beforeEach(() => {
  req = request({})
  res = {
    render: jest.fn(),
    redirect: jest.fn(),
    locals: {},
  } as unknown as Response
})

describe('redirectToResults', () => {
  test('should render error message when query is null', () => {
    redirectToResults(false, template, templateFields)(req, res)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(template, {
      probationSearchResults: { errorMessage: { text: 'Please enter a search term' }, query: '' },
    })
  })

  test('should render error message when query is empty string', () => {
    req = request({ 'probation-search-input': '' })

    redirectToResults(false, template, templateFields)(req, res)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(template, {
      probationSearchResults: { errorMessage: { text: 'Please enter a search term' }, query: '' },
    })
  })

  test('should redirect when query is not empty', () => {
    req = request({ 'probation-search-input': 'test' })

    redirectToResults(false, template, templateFields)(req, res)
    expect(res.render).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('http://localhost/search?q=test&page=1')
  })

  test('should handle empty query when allowEmptyQuery is true', () => {
    redirectToResults(true, template, templateFields)(req, res)

    expect(res.render).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('http://localhost/search?q=&page=1')
  })

  test('should redirect with query parameter when allowEmptyQuery is true and query is not empty', () => {
    req = request({ 'probation-search-input': 'test' })

    redirectToResults(true, template, templateFields)(req, res)

    expect(res.render).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('http://localhost/search?q=test&page=1')
  })

  test('should pass through custom template fields', () => {
    const templateFields = () => ({ field1: 'value1', field2: 'value2' })

    redirectToResults(false, template, templateFields)(req, res)

    expect(res.render).toHaveBeenCalledWith(template, {
      probationSearchResults: { errorMessage: { text: 'Please enter a search term' }, query: '' },
      field1: 'value1',
      field2: 'value2',
    })
    expect(res.redirect).not.toHaveBeenCalled()
  })
})

describe('renderResults', () => {
  it('should render an error message when query is too long', () => {
    req.query.q = '12345'
    const maxQueryLength = 4

    renderResults(client, 10, 7, maxQueryLength, jest.fn(), template, templateFields)(req, res, jest.fn())

    expect(client.search).not.toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(template, {
      probationSearchResults: { errorMessage: { text: 'Query must be 4 characters or less.' }, query: '12345' },
    })
  })
})
