export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    probationSearch?: ProbationSearch.SearchParameters
  }
}

export declare global {
  namespace ProbationSearch {
    interface SearchParameters extends Record<string, string | string[]> {
      query?: string
    }
  }
}
