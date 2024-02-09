# Probation Search Front-end Components

A Nunjucks component and Express middleware to search for probation cases.

Use this component to build probation case search functionality into your HMPPS service and deliver a consistent search
experience to probation practitioners.

Try it out in the dev environment: https://probation-search-dev.hmpps.service.justice.gov.uk/examples

## Get started

This guide assumes you are using
the [hmpps-template-typescript](https://github.com/ministryofjustice/hmpps-template-typescript).

### 1. Install the dependency

```shell
npm install --save @ministryofjustice/probation-search-frontend
```

### 2. Add the Nunjucks macro

Add the Nunjucks component library to your `nunjucksSetup.ts` file:

```typescript
const njkEnv = nunjucks.configure([
  ...
    "node_modules/@ministryofjustice/probation-search-frontend/components" // <-- add this
]);
```

> Full example:
> [utils/nunjucksSetup.ts](https://github.com/ministryofjustice/probation-search-ui/blob/main/server/utils/nunjucksSetup.ts)


Then, use the `caseSearch` component in your view:

```nunjucks
{% from "probation/case-search/macro.njk" import caseSearch %}

{{ caseSearch({ 
    id: "search", 
    results: searchResults 
}) }}
```

> Full example:
> [views/search.njk](https://github.com/ministryofjustice/probation-search-ui/blob/main/server/views/pages/search.njk)

### 3. Configure the Express routes

Create an instance of the `CaseSearchService`:

```ts
import CaseSearchService from '@ministryofjustice/probation-search-frontend/service/caseSearchService'

const searchService = new CaseSearchService({
  environment: config.environment,      // whether you want to search cases in the dev, preprod or prod environment 
  oauthClient: service.hmppsAuthClient, // a reference to your HMPPS Auth client
})
```

> Full example:
> [services/index.ts](https://github.com/ministryofjustice/probation-search-ui/blob/main/server/services/index.ts)


Then use it to set up the post and get routes for your search page.

```ts
router.post('/search', searchService.post)
router.get('/search', searchService.get, (req, res) => res.render('pages/search'))
```

> Full example:
> [routes/search.ts](https://github.com/ministryofjustice/probation-search-ui/blob/main/server/routes/search.ts)

That's it! Start your service and visit http://localhost:3000/search to try it out.

## Examples

For a fully working example, check out
the [probation-search-ui](https://github.com/ministryofjustice/probation-search-ui) project.

The front-end can be accessed here: https://probation-search-dev.hmpps.service.justice.gov.uk/search

## Configuration

### Nunjucks (front-end) configuration

The `caseSearch` Nunjucks macro takes the following options:

| Option    | Description                                                                                                                                                                                | Default                                                                                      |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| `label`   | The label used by the text input component.                                                                                                                                                | "Find a person on probation"                                                                 |
| `hint`    | Can be used to add a hint to the text input component.                                                                                                                                     | "You can search by name, date of birth or any other identifier (for example CRN or PNC id)." |
| `id`      | The id of the text input field                                                                                                                                                             | "search"                                                                                     |
| `type`    | Type of input control to render.                                                                                                                                                           | "search"                                                                                     |
| `classes` | Classes to add to the input.                                                                                                                                                               | ""                                                                                           |
| `results` | This must always be set to `searchResults`. The value of `searchResults` is populated by the Express routes, and contains the results of the search query to be rendered by the component. | (none)                                                                                       |

### Express (back-end) configuration

The `CaseSearchService` function takes the following options:

| Option           | Description                                                                                                                                                                                   | Default                                   |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `environment`    | Whether you want to search cases in the dev, preprod or prod environment. You can also specify `local` to use some hard-coded test data - override the test data by setting `localData`.      | (none)                                    |
| `oauthClient`    | A function for returning a HMPPS Auth client_credentials token. This will be used to get a token for calling the Probation Search API.                                                        | (none)                                    |
| `resultPath`     | A function used to generate a link to the case in your service, based on the case reference number (CRN).                                                                                     | (crn: string) => `/case/${crn}`           |
| `extraColumns`   | An optional array of extra columns to display in search results, in addition to Name, CRN, and Date of Birth. For example, to add an Age column: `[{ header: 'Age', result => result.age }]`. | []                                        |
| `pageSize`       | The number of results to return per page.                                                                                                                                                     | 10                                        |
| `maxPagesToShow` | The maximum number of pages to show on the paginator.                                                                                                                                         | 7                                         |
| `localData`      | A list of search results to return during local development (i.e. when environment = 'local')                                                                                                 | Two dummy records - John Doe and Jane Doe |

## Support

For any issues or questions, please contact the Probation Integration team via
the [#probation-integration-tech](https://mojdt.slack.com/archives/C02HQ4M2YQN) Slack channel. Or feel free to create
a [new issue](https://github.com/ministryofjustice/probation-search-frontend/issues/new) in this repository.