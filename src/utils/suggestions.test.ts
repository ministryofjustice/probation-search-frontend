import { Request } from 'express'
import getSuggestionLinks from './suggestions'

describe('suggestions', () => {
  const response = {
    suggestions: {
      suggest: {
        mispelled: [
          {
            text: 'mispelled',
            offset: 0,
            length: 9,
            options: [
              {
                text: 'misspelled',
                freq: 2,
                score: 2,
              },
              {
                text: 'mis-spelled',
                freq: 1,
                score: 1,
              },
            ],
          },
        ],
        qery: [
          {
            text: 'qery',
            offset: 10,
            length: 4,
            options: [
              {
                text: 'query',
                freq: 2,
                score: 2,
              },
            ],
          },
        ],
      },
    },
  }

  it('should include the new query', () => {
    const suggestions = getSuggestionLinks(response, {
      session: { probationSearch: { query: 'mispelled qery' } },
    } as unknown as Request)

    expect(suggestions.length).toEqual(3)
    expect(suggestions[0]!.text).toEqual('misspelled')
    expect(suggestions[0]!.newQuery).toEqual('misspelled qery')
    expect(suggestions[1]!.text).toEqual('query')
    expect(suggestions[1]!.newQuery).toEqual('mispelled query')
    expect(suggestions[2]!.text).toEqual('mis-spelled')
    expect(suggestions[2]!.newQuery).toEqual('mis-spelled qery')
  })

  it('handles null session', () => {
    const suggestions = getSuggestionLinks(response, { session: null } as unknown as Request)
    expect(suggestions.length).toEqual(3)
    expect(suggestions[0]!.text).toEqual('misspelled')
    expect(suggestions[0]!.newQuery).toEqual('misspelled')
    expect(suggestions[1]!.text).toEqual('query')
    expect(suggestions[1]!.newQuery).toEqual('query')
    expect(suggestions[2]!.text).toEqual('mis-spelled')
    expect(suggestions[2]!.newQuery).toEqual('mis-spelled')
  })
})
