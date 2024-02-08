import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Environment, EnvironmentConfig } from '../environments'
import SearchService from './searchService'
import OAuthClient from '../data/oauthClient'
import { addParameters, removeParameters } from '../utils/url'
import getSuggestionLinks from '../utils/suggestions'
import getPaginationLinks from '../utils/pagination'
import ProbationSearchClient, { ProbationSearchResult } from '../data/probationSearchClient'
import localData from '../data/localData'
import wrapAsync from '../utils/middleware'
import { format, parseISO } from 'date-fns'
import { highlighter } from '../utils/highlighting'

export interface CaseSearchOptions {
  environment: Environment | EnvironmentConfig
  oauthClient: OAuthClient
  resultPath?: (crn: string) => string
  maxQueryLength?: number
  allowEmptyQuery?: boolean
  pageSize?: number
  localData?: ProbationSearchResult[]
}

export default class CaseSearchService implements SearchService {
  private declare readonly options: Required<CaseSearchOptions>
  private declare readonly client: ProbationSearchClient

  public constructor(options: CaseSearchOptions) {
    const defaults = {
      resultPath: (crn: string) => `/case/${crn}`,
      allowEmptyQuery: false,
      maxQueryLength: 100,
      pageSize: 10,
      localData,
    }
    this.options = Object.assign(defaults, options)
    this.client = new ProbationSearchClient(
      this.options.oauthClient,
      this.options.environment === 'local' ? this.options.localData : this.options.environment,
    )
  }

  post: RequestHandler = (req: Request, res: Response) => {
    // Add the query to the session
    if (!req.session.probationSearch) req.session.probationSearch = {}
    req.session.probationSearch.query = req.body['probation-search-input'] as string
    res.redirect(removeParameters(req, 'page'))
  }

  get: RequestHandler = wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { resultPath, allowEmptyQuery, maxQueryLength, pageSize } = this.options

    // Render an empty search screen if no session
    if (!('probationSearch' in req.session) || !req.session.probationSearch) {
      return this.noSearch(res, next)
    }

    // Validate query string from session
    const { query, matchAllTerms, providers } = req.session.probationSearch
    if (!query) {
      return allowEmptyQuery
        ? this.noSearch(res, next)
        : this.errorMessage(req, res, next, 'Please enter a search term')
    }
    if (maxQueryLength && query.length > maxQueryLength) {
      return this.errorMessage(req, res, next, `Query must be ${maxQueryLength} characters or less.`, query)
    }

    // Load search results
    const request = {
      query,
      matchAllTerms: (matchAllTerms ?? 'true') === 'true',
      providersFilter: providers ?? [],
      asUsername: res.locals.user.username,
      pageNumber: req.query.page ? Number.parseInt(req.query.page as string, 10) : 1,
      pageSize,
    }
    const response = await this.client.search(request)

    // Parse and render results
    res.locals.searchResults = {
      query,
      response,
      suggestions: getSuggestionLinks(response, req),
      pagination: getPaginationLinks(
        request.pageNumber,
        response.totalPages,
        response.totalElements,
        page => addParameters(req, { page: page.toString() }),
        pageSize,
      ),
      fn: {
        resultPath,
        formatDate: (date?: string) => (date ? format(parseISO(date), 'dd/MM/yyyy') : ''),
        highlight: highlighter(query),
      },
      ...this.securityContext(res),
    }
    res.locals.searchRequest = request
    res.locals.searchResponse = response
    next()
  })

  /**
   * Render an empty search screen
   * @param res
   * @param next
   * @private
   */
  private noSearch(res: Response, next: NextFunction) {
    res.locals.searchResults = this.securityContext(res)
    return next()
  }

  /**
   * Render an error message
   * @param req
   * @param res
   * @param next
   * @param text
   * @param query
   * @param errorMessage
   * @private
   */
  private errorMessage(
    req: Request,
    res: Response,
    next: NextFunction,
    text: string,
    query: string = '',
    errorMessage = { text },
  ) {
    delete req.session.probationSearch
    res.locals.searchResults = { errorMessage, query, ...this.securityContext(res) }
    return next()
  }

  /**
   * These parameters are required in the Nunjucks component, we ensure they are
   * passed through from the Express router via the results param.
   * @param res
   * @private
   */
  private securityContext(res: Response): { csrfToken: string; cspNonce: string; user: { username: string } } {
    return {
      csrfToken: res.locals.csrfToken,
      cspNonce: res.locals.cspNonce,
      user: res.locals.user,
    }
  }
}
