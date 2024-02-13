import superagent from 'superagent'
import OAuthClient from './oauthClient'
import environments, { EnvironmentConfig } from '../environments'

export default class ProbationSearchClient {
  constructor(private dataSource: 'dev' | 'preprod' | 'prod' | EnvironmentConfig | ProbationSearchResult[]) {}

  async search(
    token: string,
    { query, matchAllTerms = true, providersFilter = [], pageNumber = 1, pageSize = 10 }: ProbationSearchRequest,
  ): Promise<ProbationSearchResponse> {
    if (this.dataSource instanceof Array) {
      return Promise.resolve(this.localSearch(this.dataSource, pageNumber, pageSize))
    }
    const apiConfig = this.getApiConfig(this.dataSource).searchApi
    const response = await superagent
      .post(`${apiConfig.url}/phrase?page=${pageNumber - 1}&size=${pageSize}}`)
      .auth(token, { type: 'bearer' })
      .timeout(apiConfig.timeout)
      .retry(2)
      .send({
        phrase: query,
        probationAreasFilter: providersFilter.map(provider => provider.substring(0, 3)),
        matchAllTerms,
      })
    return response.body
  }

  private localSearch(data: ProbationSearchResult[], page: number, size: number): ProbationSearchResponse {
    const content = data.slice((page - 1) * size, page * size)
    return {
      content,
      probationAreaAggregations: [],
      size: content.length,
      totalElements: data.length,
      totalPages: Math.ceil(data.length / size),
    }
  }

  private getApiConfig(dataSource: 'dev' | 'preprod' | 'prod' | EnvironmentConfig): EnvironmentConfig {
    if (dataSource === 'dev' || dataSource === 'preprod' || dataSource === 'prod') return environments[dataSource]
    return dataSource
  }
}

export interface ProbationSearchRequest {
  query: string
  matchAllTerms: boolean
  providersFilter: string[]
  pageNumber: number
  pageSize: number
}

export interface ProbationSearchResponse {
  content: ProbationSearchResult[]
  suggestions?: {
    suggest?: { [key: string]: Suggestion[] }
  }
  probationAreaAggregations: {
    code: string
    description: string
    count: number
  }[]
  size: number
  totalElements: number
  totalPages: number
}

export interface ProbationSearchResult {
  previousSurname?: string
  offenderId: number
  title?: string
  firstName?: string
  middleNames?: string[]
  surname?: string
  dateOfBirth?: string
  gender?: string
  otherIds: {
    crn: string
    pncNumber?: string
    croNumber?: string
    niNumber?: string
    nomsNumber?: string
    immigrationNumber?: string
    mostRecentPrisonerNumber?: string
    previousCrn?: string
  }
  contactDetails?: {
    phoneNumbers?: {
      number?: string
      type?: 'TELEPHONE' | 'MOBILE'
    }[]
    emailAddresses?: string[]
    allowSMS?: boolean
    addresses?: {
      id: number
      from: string
      to?: string
      noFixedAbode?: boolean
      notes?: string
      addressNumber?: string
      buildingName?: string
      streetName?: string
      district?: string
      town?: string
      county?: string
      postcode?: string
      telephoneNumber?: string
      status?: {
        code?: string
        description?: string
      }
      type?: {
        code?: string
        description?: string
      }
    }[]
  }
  offenderProfile?: {
    ethnicity?: string
    nationality?: string
    secondaryNationality?: string
    notes?: string
    immigrationStatus?: string
    offenderLanguages?: {
      primaryLanguage?: string
      otherLanguages?: string[]
      languageConcerns?: string
      requiresInterpreter?: boolean
    }
    religion?: string
    sexualOrientation?: string
    offenderDetails?: string
    remandStatus?: string
    previousConviction?: {
      convictionDate?: string
      detail?: {
        [key: string]: string
      }
    }
    riskColour?: string
    disabilities?: {
      disabilityId?: number
      disabilityType?: {
        code?: string
        description?: string
      }
      condition?: {
        code?: string
        description?: string
      }
      startDate?: string
      endDate?: string
      notes?: string
    }[]
    provisions?: {
      provisionId?: number
      provisionType?: {
        code?: string
        description?: string
      }
      category?: {
        code?: string
        description?: string
      }
      startDate?: string
      endDate?: string
      notes?: string
    }[]
  }
  offenderAliases?: {
    id?: string
    dateOfBirth?: string
    firstName?: string
    middleNames?: string[]
    surname?: string
    gender?: string
  }[]
  offenderManagers?: {
    trustOfficer?: {
      forenames?: string
      surname?: string
    }
    staff?: {
      code?: string
      forenames?: string
      surname?: string
      unallocated?: boolean
    }
    providerEmployee?: {
      forenames?: string
      surname?: string
    }
    partitionArea?: string
    softDeleted?: boolean
    team?: {
      code?: string
      description?: string
      telephone?: string
      localDeliveryUnit?: {
        code?: string
        description?: string
      }
      district?: {
        code?: string
        description?: string
      }
      borough?: {
        code?: string
        description?: string
      }
    }
    probationArea?: {
      probationAreaId: number
      code?: string
      description?: string
      nps?: boolean
      organisation?: {
        code?: string
        description?: string
      }
      institution?: {
        institutionId?: number
        isEstablishment?: boolean
        code?: string
        description?: string
        institutionName?: string
        establishmentType?: {
          code?: string
          description?: string
        }
        isPrivate?: boolean
        nomsPrisonInstitutionCode?: string
      }
      teams?: {
        providerTeamId: number
        teamId: number
        code?: string
        description?: string
        name?: string
        isPrivate?: boolean
        externalProvider?: {
          code?: string
          description?: string
        }
        scProvider?: {
          code?: string
          description?: string
        }
        localDeliveryUnit?: {
          code?: string
          description?: string
        }
        district?: {
          code?: string
          description?: string
        }
        borough?: {
          code?: string
          description?: string
        }
      }[]
    }
    fromDate?: string
    toDate?: string
    active?: boolean
    allocationReason?: {
      code?: string
      description?: string
    }
  }[]
  softDeleted?: boolean
  currentDisposal?: string
  partitionArea?: string
  currentRestriction?: boolean
  restrictionMessage?: string
  currentExclusion?: boolean
  exclusionMessage?: string
  highlight?: { [key: string]: string[] }
  accessDenied?: boolean
  currentTier?: string
  activeProbationManagedSentence?: boolean
  mappa?: {
    level?: number
    levelDescription?: string
    category?: number
    categoryDescription?: string
    startDate?: string
    reviewDate?: string
    team?: {
      code?: string
      description?: string
    }
    officer?: {
      code?: string
      forenames?: string
      surname?: string
      unallocated?: boolean
    }
    probationArea?: {
      code?: string
      description?: string
    }
    notes?: string
  }
  probationStatus?: {
    status: string
    previouslyKnownTerminationDate?: string
    inBreach?: boolean
    preSentenceActivity: boolean
    awaitingPsr: boolean
  }
  age?: number
}

export interface Suggestion {
  text: string
  offset: number
  length: number
  options: {
    text: string
    freq: number
    score: number
  }[]
}
