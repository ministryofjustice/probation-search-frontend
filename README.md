# Probation Search Front-end Components

A Nunjucks component to search for probation cases.

Use this component to build probation case search functionality into your HMPPS service and deliver a consistent search
experience to probation practitioners.

Try it out in the dev environment: https://probation-search-dev.hmpps.service.justice.gov.uk/examples

## Get started

### 1. Install the dependency

```shell
npm install --save @ministryofjustice/probation-search-frontend
```

### 2. Add the Nunjucks macro to your search page

Register the macro by adding the `'node_modules/@ministryofjustice/probation-search-frontend/components'` path to your
`nunjucksSetup.ts` file, then add the following to your Nunjucks page template:

```nunjuck
{% from "probation/case-search/macro.njk" import caseSearch %}

{{ caseSearch({ id: "search", results: searchResults }) }}
```

Example:

* [nunjucksSetup.ts](https://github.com/ministryofjustice/hmpps-sentence-plan-ui/blob/4cf961428e4c4e69565367bf7af17bac8c8da674/server/utils/nunjucksSetup.ts#L34)
* [search.njk](https://github.com/ministryofjustice/hmpps-sentence-plan-ui/blob/4cf961428e4c4e69565367bf7af17bac8c8da674/server/views/pages/search.njk)

### 3. Configure the Express routes

Create an instance of the `CaseSearchService`, and use it to set up the post and get routes for your search page.

```ts
import CaseSearchService from '@ministryofjustice/probation-search-frontend/service/caseSearchService'

const search = new CaseSearchService({
  environment: config.environment,      // whether you want to search cases in the dev, preprod or prod environment 
  oauthClient: service.hmppsAuthClient, // a reference to your HMPPS Auth client
})

router.post('/search', search.post)
router.get('/search', search.get, (req, res) => res.render('pages/search'))
```

Example: [routes/index.ts](https://github.com/ministryofjustice/hmpps-sentence-plan-ui/blob/4cf961428e4c4e69565367bf7af17bac8c8da674/server/routes/index.ts#L16)

That's it! Start your service and visit http://localhost:3000/search to try it out.

## Examples

For a fully working example, check out
the [hmpps-sentence-plan-ui](https://github.com/search?q=%28repo%3Aministryofjustice%2Fhmpps-sentence-plan-ui+probationSearch%29+OR+%28repo%3Aministryofjustice%2Fhmpps-sentence-plan-ui+probation-search-frontend%29&type=code)
project.

The front-end can be accessed here: https://sentence-plan-dev.hmpps.service.justice.gov.uk/search

## Configuration

### Nunjucks (front-end) configuration

The `caseSearch` Nunjucks macro takes the following options:

| Option    | Description                                                                                                                                                                                  | Default |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `id`      | The id of the input field                                                                                                                                                                    | search  |
| `results` | This should always be set to `searchResults`. The value of `searchResults` is populated by the Express routes, and contains the results of the search query to be rendered by the component. | (none)  |

// TODO document remaining config

### Express (back-end) configuration

The `CaseSearchService` function takes the following options:

| Option           | Description                                                                                                                                                                              | Default                                   |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `environment`    | Whether you want to search cases in the dev, preprod or prod environment. You can also specify `local` to use some hard-coded test data - override the test data by setting `localData`. | (none)                                    |
| `oauthClient`    | A function for returning a HMPPS Auth client_credentials token. This will be used to get a token for calling the Probation Search API.                                                   | (none)                                    |
| `resultPath`     | A function used to generate a link to the case in your service, based on the case reference number (CRN).                                                                                | (crn: string) => `/case/${crn}`           |
| `pageSize`       | The number of results to return per page.                                                                                                                                                | 10                                        |
| `maxPagesToShow` | The maximum number of pages to show on the paginator.                                                                                                                                    | 7                                         |
| `localData`      | A list of search results to return during local development (i.e. when environment = 'local')                                                                                            | Two dummy records - John Doe and Jane Doe |

### Formatting results

// TODO

## How it works

// TODO

## Support

For any issues or questions, please contact the Probation Integration team via
the [#probation-integration-tech](https://mojdt.slack.com/archives/C02HQ4M2YQN) Slack channel. Or feel free to create
a [new issue](https://github.com/ministryofjustice/probation-search-frontend/issues/new) in this repository.