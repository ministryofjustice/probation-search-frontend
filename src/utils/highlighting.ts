import { Chunk, findAll } from 'highlight-words-core'

export default function highlighter(query?: string) {
  return function highlight(textToHighlight?: string, shouldHighlight: boolean = true): string | undefined {
    if (!shouldHighlight || !textToHighlight || !query || query.trim().length === 0) {
      return textToHighlight
    }
    return findAll({
      textToHighlight,
      searchWords: query?.split(' ') ?? [],
      autoEscape: true,
    })
      .map(({ start, end, highlight: hasHighlight }: Chunk) => {
        const text = textToHighlight.substring(start, end)
        return hasHighlight ? `<span class="govuk-tag--yellow">${text}</span>` : text
      })
      .join('')
  }
}
