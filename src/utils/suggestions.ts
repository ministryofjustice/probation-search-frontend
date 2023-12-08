import { Request } from 'express'
import { ProbationSearchResponse } from '../data/probationSearchClient'

export interface SuggestionLink {
  text: string
  newQuery: string
}

export default function getSuggestionLinks(
  response: { suggestions?: ProbationSearchResponse['suggestions'] },
  req: Request,
): SuggestionLink[] {
  const query = req.session?.probationSearch?.query ?? ''
  return Object.values(response?.suggestions?.suggest || {})
    .flatMap(suggestions => suggestions.flatMap(s => s.options.map(o => ({ ...s, ...o }))))
    .sort((a, b) => b.score - a.score || b.freq - a.freq)
    .slice(0, 3)
    .map(s => ({ ...s, newQuery: query.slice(0, s.offset) + s.text + query.slice(s.offset + s.length) }))
}
