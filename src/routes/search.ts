import { format, parseISO } from 'date-fns'
import { Request, Response, Router } from 'express'
import ProbationSearchClient, {
  ProbationSearchRequest,
  ProbationSearchResponse,
  ProbationSearchResult,
} from '../data/probationSearchClient'
import OAuthClient from '../data/oauthClient'
import data from '../data/localData'
import getPaginationLinks, { Pagination } from '../utils/pagination'
import getSuggestionLinks, { SuggestionLink } from '../utils/suggestions'
import wrapAsync from '../utils/middleware'
import { addParameters, getAbsoluteUrl } from '../utils/url'
import { Environment, EnvironmentConfig } from '../environments'

export default function probationSearchRoutes({
  environment,
  oauthClient,
  router,
  path = '/search',
  resultPath = (crn: string) => `/case/${crn}`,
  template = 'pages/search',
  templateFields = () => ({}),
  nameFormatter = (result: ProbationSearchResult) => `${result.firstName} ${result.surname}`,
  dateFormatter = (date: Date) => format(date, 'dd/MM/yyyy'),
  resultsFormatter = defaultResultFormatter(resultPath, nameFormatter, dateFormatter),
  localData = data,
  allowEmptyQuery = false,
  maxQueryLength = 100,
  pageSize = 10,
  maxPagesToShow = 7,
}: ProbationSearchRouteOptions): Router {
  const client = new ProbationSearchClient(oauthClient, environment === 'local' ? localData : environment)

  router.post(path, saveQueryToSession)
  router.get(path, wrapAsync(renderResults))

  function saveQueryToSession(req: Request, res: Response) {
    req.session.probationSearch = { query: req.body['probation-search-input'] as string }
    res.redirect(getAbsoluteUrl(req))
  }

  async function renderResults(req: Request, res: Response) {
    const extraFields = templateFields(req, res)

    // Util functions
    const noSearch = () => res.render(template, { probationSearchResults: securityParams(res), ...extraFields })
    const errorMessage = (text: string, query: string = '', errorMessage = { text }) => {
      delete req.session.probationSearch
      res.render(template, { probationSearchResults: { errorMessage, query, ...securityParams(res) }, ...extraFields })
    }

    // Render an empty search screen if no session
    if (!('probationSearch' in req.session) || !req.session.probationSearch) {
      return noSearch()
    }

    // Validate query string from session
    const { query } = req.session.probationSearch
    if (!query) {
      return allowEmptyQuery ? noSearch() : errorMessage('Please enter a search term')
    }
    if (maxQueryLength && query.length > maxQueryLength) {
      return errorMessage(`Query must be ${maxQueryLength} characters or less.`, query)
    }

    // Load search results
    const request = {
      query,
      matchAllTerms: (req.query.matchAllTerms ?? 'true') === 'true',
      providersFilter: (req.query.providers as string[]) ?? [],
      asUsername: res.locals.user.username,
      pageNumber: req.query.page ? Number.parseInt(req.query.page as string, 10) : 1,
      pageSize,
    }
    const response = await client.search(request)

    // Parse and render results
    const probationSearchResults: ResultTemplateParams = {
      query,
      response,
      results: await resultsFormatter(response, request),
      suggestions: getSuggestionLinks(response, req),
      pagination: getPaginationLinks(
        request.pageNumber,
        response.totalPages,
        response.totalElements,
        page => addParameters(req, { page: page.toString() }),
        pageSize,
        maxPagesToShow,
      ),
      ...securityParams(res),
    }
    res.render(template, { probationSearchResults, ...extraFields })
  }

  return router
}

function defaultResultFormatter(
  resultPath: (crn: string) => string,
  nameFormatter: (probationSearchResult: ProbationSearchResult) => string,
  dateFormatter: (date: Date) => string,
): (response: ProbationSearchResponse, request: ProbationSearchRequest) => Promise<string | Table> {
  return async (response: ProbationSearchResponse) => ({
    head: [{ text: 'Name' }, { text: 'CRN' }, { text: 'Date of Birth' }],
    rows: response.content?.map(result =>
      result.accessDenied
        ? [{ html: `Restricted access` }, { text: result.otherIds.crn }, { text: '' }]
        : [
            { html: `<a href="${resultPath(result.otherIds.crn)}">${nameFormatter(result)}</a>` },
            { text: result.otherIds.crn },
            { text: result.dateOfBirth ? dateFormatter(parseISO(result.dateOfBirth)) : '' },
          ],
    ),
  })
}

function securityParams(res: Response): { csrfToken: string; cspNonce: string; user: { username: string } } {
  return {
    csrfToken: res.locals.csrfToken,
    cspNonce: res.locals.cspNonce,
    user: res.locals.user,
  }
}

export type ProbationSearchRouteOptions = {
  environment: Environment | EnvironmentConfig
  oauthClient: OAuthClient
  router: Router
  path?: string
  template?: string
  localData?: ProbationSearchResult[]
  pageSize?: number
  maxPagesToShow?: number
  templateFields?: (req: Request, res: Response) => object
  resultPath?: (crn: string) => string
  nameFormatter?: (result: ProbationSearchResult) => string
  dateFormatter?: (date: Date) => string
  resultsFormatter?: (
    apiResponse: ProbationSearchResponse,
    apiRequest: ProbationSearchRequest,
  ) => Promise<string | Table>
  allowEmptyQuery?: boolean
  maxQueryLength?: number
}

interface SuccessParams {
  query: string
  results: string | Table
  response: ProbationSearchResponse
  suggestions: SuggestionLink[]
  pagination: Pagination
  csrfToken: string
  cspNonce: string
}

interface ErrorParams {
  errorMessage: { text: string }
  csrfToken: string
  cspNonce: string
}

export type ResultTemplateParams = SuccessParams | ErrorParams

export interface Table {
  head: { text: string }[]
  rows: { html?: string; text?: string }[][]
}
