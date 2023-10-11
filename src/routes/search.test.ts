import { redirectToResults } from './search'
import { Request, Response } from 'express'

describe('redirectToResults', () => {
  const request = (body: any) =>
    ({ body, protocol: 'http', get: () => 'localhost', originalUrl: '/search' }) as unknown as Request
  const template = 'search'
  const templateFields = () => ({})

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

  test('should render error message when query is empty', () => {
    redirectToResults(false, template, templateFields)(req, res)

    expect(res.redirect).not.toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith(template, {
      probationSearchResults: { errorMessage: { text: 'Please enter a search term' } },
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
      probationSearchResults: { errorMessage: { text: 'Please enter a search term' } },
      field1: 'value1',
      field2: 'value2',
    })
    expect(res.redirect).not.toHaveBeenCalled()
  })
})
