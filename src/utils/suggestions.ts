import { Request } from 'express'
import { ProbationSearchResponse, Suggestion } from '../data/probationSearchClient'
import { getAbsoluteUrl } from './url'

export interface SuggestionLink {
  text: string
  url: string
}

function getSuggestionUrl(req: Request, text: Suggestion): string {
  const url = new URL(getAbsoluteUrl(req))
  const oldQuery = url.searchParams.get('q') ?? ''
  const newQuery = oldQuery.slice(0, text.offset) + text.text + oldQuery.slice(text.offset + text.length)
  url.searchParams.set('q', newQuery)
  return url.toString()
}

export default function getSuggestionLinks(
  response: { suggestions?: ProbationSearchResponse['suggestions'] },
  req: Request,
): SuggestionLink[] {
  return Object.values(response?.suggestions?.suggest || {})
    .flatMap(suggestions => suggestions.flatMap(s => s.options.map(o => ({ ...s, ...o }))))
    .sort((a, b) => b.score - a.score || b.freq - a.freq)
    .slice(0, 3)
    .map(s => ({ ...s, url: getSuggestionUrl(req, s) }))
}
