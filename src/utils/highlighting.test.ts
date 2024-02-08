import { highlighter } from './highlighting'

describe('highlightText', () => {
  it.each([
    [undefined, undefined, undefined],
    [undefined, 'undefined', undefined],
    ['Hello world', undefined, 'Hello world'],
    ['Hello world', 'world', 'Hello <span class="govuk-tag--yellow">world</span>'],
    ['Hello world', 'hello', '<span class="govuk-tag--yellow">Hello</span> world'],
    [
      'Hello world',
      'hello world',
      '<span class="govuk-tag--yellow">Hello</span> <span class="govuk-tag--yellow">world</span>',
    ],
    ['Hello world)', 'world)', 'Hello <span class="govuk-tag--yellow">world)</span>'],
  ])('should highlight text correctly', (textToHighlight, query, expected) => {
    expect(highlighter(query)(textToHighlight, true)).toEqual(expected)
  })
})
