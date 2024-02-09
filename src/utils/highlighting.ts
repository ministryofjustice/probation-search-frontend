import { Chunk, findAll } from 'highlight-words-core'

export function highlighter(query?: string) {
  return function (textToHighlight?: string, shouldHighlight: boolean = true): string | undefined {
    if (!shouldHighlight || !textToHighlight || !query) {
      return textToHighlight
    }
    return findAll({
      textToHighlight,
      searchWords: query?.split(' ') ?? [],
      autoEscape: true,
    })
      .map(({ end, highlight, start }: Chunk) => {
        const text = textToHighlight.substring(start, end)
        return highlight ? `<span class="govuk-tag--yellow">${text}</span>` : text
      })
      .join('')
  }
}
