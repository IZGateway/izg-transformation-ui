import * as React from 'react'
import ConnectionsTable from '../../components/ConnectionTable'
import ErrorBoundary from '../../components/ErrorBoundary'
import Container from '../../components/Container'
import { useEffect, useState, useContext } from 'react'
import CustomSnackbar from '../../components/SnackBar'
import CombinedContext from '../../contexts/app'
import _ from 'lodash'
import { InferGetServerSidePropsType } from 'next'
import AppHeaderBar from '../../components/AppHeader'

const Manage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { alert, setAlert } = useContext(CombinedContext)
  const [showSnackbar, setShowSnackbar] = useState(false)

  useEffect(() => {
    if (!_.isEmpty(alert.level)) {
      setShowSnackbar(true)
    } else {
      setShowSnackbar(false)
    }
  }, [alert])

  const handleClose = () => {
    setShowSnackbar(false)
    setAlert({
      level: '',
      jurisdiction: '',
      dest_type: '',
      message: '',
    })
  }

  return (
    <Container title="Manage Connections">
      <AppHeaderBar open />
      <ErrorBoundary>
        <ConnectionsTable data={props.data} />
        <CustomSnackbar
          open={showSnackbar}
          severity={alert.level}
          message={alert.message}
          onClose={handleClose}
        />
      </ErrorBoundary>
    </Container>
  )
}

export default Manage

export const getServerSideProps = async () => {
  // const session = await getServerSession(context.req, context.res, authOptions)
  // const endpointStatuses = await fetchEndpointStatus(
  //   session.user.isAdmin,
  //   session.user.jurisdictions
  // )
  // const endpoints = []
  // for (const endpoint of endpointStatuses) {
  //   const data = {}
  //   for (const [key, value] of Object.entries(endpoint)) {
  //     const destArray = Promise.all(
  //       value.map(async (x) => {
  //         return {
  //           ...x,
  //           hasChangeRequest: await hasActiveChangeRequest(
  //             x.destId,
  //             x.destTypeId
  //           ),
  //           hasActiveDraft: await hasActiveDraft(x.destId, x.destTypeId),
  //           hasActiveMaint: await hasActiveMaintenance(x.destId, x.destTypeId),
  //           getMaintenaceValues: await getMaintenaceValues(
  //             x.destId,
  //             x.destTypeId
  //           ),
  //         }
  //       })
  //     )
  //     data[key] = await destArray
  //     endpoints.push(data)
  //   }
  // }
  return {
    props: {
      data: [
        {
          organizationName: 'Oklahoma',
          organizationId: '0d15449b-fb08-4013-8985-20c148b353fe',
          active: true,
          pipelines: [
            {
              pipelineName: 'Maryland Pipeline',
              pipelineId: '018f5ebf-fe48-709a-aaa4-e74552ae3a66',
              description: 'Transformations needed for Maryland',
              inboundEndpoint: {
                endpointId: 'd078f13a-2bed-45bc-b76a-c67a754e492c',
                endpointName: 'IZ Gateway Transformation Service',
                active: true,
              },
              outboundEndpoint: {
                endpointId: 'd4074a1e-987e-4cf3-9071-c0aec2350993',
                endpointName: 'IZ Gateway Hub',
                active: true,
              },
              pipes: [
                {
                  preconditions: [
                    {
                      method: 'equals',
                      dataPath: '/MSH-1-1',
                      comparisonValue: '|',
                    },
                  ],
                  solutionId: '018f7881-7607-7220-a94b-fe0c7e81cbec',
                  solutionName: 'TEST',
                  version: '1.0',
                },
                {
                  preconditions: [
                    {
                      method: 'not_equals',
                      dataPath: '/MSH-1-1',
                      comparisonValue: 'x',
                    },
                  ],
                  solutionId: '64bc92f4-053c-4e55-85b5-5ff52f5ff47f',
                  solutionName: null,
                  version: '1.0',
                },
                {
                  preconditions: [
                    {
                      method: 'regex_match',
                      dataPath: '/MSH-1-1',
                      regex: '^\\|$',
                    },
                  ],
                  solutionId: '79def078-5953-4d31-b44a-79d4da9beef9',
                  solutionName: null,
                  version: '1.0',
                },
                {
                  preconditions: [],
                  solutionId: '8abc8887-1cab-4a96-98ea-29f8f6c977d5',
                  solutionName: null,
                  version: '1.0',
                },
              ],
              active: true,
            },
            {
              pipelineName: 'Default Pipeline',
              pipelineId: '005910e7-7359-49f0-aa76-e1db74784d88',
              description: 'Transformations needed for all IIS from Oklahoma',
              inboundEndpoint: {
                endpointId: 'd078f13a-2bed-45bc-b76a-c67a754e492c',
                endpointName: 'IZ Gateway Transformation Service',
                active: true,
              },
              outboundEndpoint: {
                endpointId: 'd4074a1e-987e-4cf3-9071-c0aec2350993',
                endpointName: 'IZ Gateway Hub',
                active: true,
              },
              pipes: [],
              active: true,
            },
          ],
        },
        {
          organizationName: 'Tennessee',
          organizationId: '6c1ca0a5-d292-4440-9832-9be4be3bdf20',
          active: true,
          pipelines: [],
        },
      ],
    },
  }
}

// const fetchEndpointStatus = async (isAdmin, jurisdictions) => {
//   const IZG_STATUS_ENDPOINT_URL = process.env.IZG_STATUS_ENDPOINT_URL || ''
//   const IZG_ENDPOINT_CRT_PATH = process.env.IZG_ENDPOINT_CRT_PATH || ''
//   const IZG_ENDPOINT_KEY_PATH = process.env.IZG_ENDPOINT_KEY_PATH || ''
//   const IZG_ENDPOINT_PASSCODE = process.env.IZG_ENDPOINT_PASSCODE || ''
//   const httpsAgentOptions = {
//     cert: fs.readFileSync(path.resolve(IZG_ENDPOINT_CRT_PATH), 'utf-8'),
//     key: fs.readFileSync(path.resolve(IZG_ENDPOINT_KEY_PATH), 'utf-8'),
//     passphrase: IZG_ENDPOINT_PASSCODE,
//     rejectUnauthorized: false,
//     keepAlive: true,
//   }

//   const configuredHubURLs = new IZGHubStatusHistoryEndpoint(
//     IZG_STATUS_ENDPOINT_URL
//   )
//   let hubURLS = configuredHubURLs.getIZGHubURLs()

//   if (!isAdmin) {
//     hubURLS = appendJurisdictionsAssignedToUser(hubURLS, jurisdictions)
//   }

//   const responses = Promise.allSettled(
//     hubURLS.map((endpoint) =>
//       axios.get(endpoint, {
//         httpsAgent: new https.Agent(httpsAgentOptions),
//         timeout: 30000,
//       })
//     )
//   )

//   const responseData = await responses

//   const endpointStatuses = [
//     ...responseData.map((response) => {
//       if (response.status !== ALL_SETTLED_SUCCESSFUL) {
//         logger.error(
//           'Error connecting to a configured statushistory endpoint: ' +
//             JSON.stringify(response)
//         )
//       } else {
//         const data = response.value.data
//         const resultCollector = []
//         for (const [key, value] of Object.entries(data)) {
//           const dest = {}
//           dest[key] = value
//           resultCollector.push(dest)
//         }
//         return resultCollector
//       }
//     }),
//   ]

//   const combinedResponses = [].concat(...endpointStatuses)
//   return combinedResponses
// }

// const hasActiveChangeRequest = async (destId, destTypeId) => {
//   return (await destinationChangeRequest(destId, destTypeId)) ? true : false
// }

// const hasActiveDraft = async (destId, destTypeId) => {
//   return (await fetchDraftRecord(destId, destTypeId)) ? true : false
// }

// const getDestinationResult = async (destId, destTypeId) => {
//   try {
//     destinationResult = await destination(destId, destTypeId)
//   } catch (error) {
//     throw new Error(error.message)
//   }
// }

// const getMaintenaceValues = async (destId, destTypeId) => {
//   await getDestinationResult(destId, destTypeId)

//   if (_.isNull(destinationResult)) {
//     return {
//       maint_start: null,
//       maint_end: null,
//     }
//   } else {
//     return {
//       maint_start: destinationResult.maint_start
//         ? destinationResult.maint_start.toISOString()
//         : null,
//       maint_end: destinationResult.maint_end
//         ? destinationResult.maint_end.toISOString()
//         : null,
//     }
//   }
// }

// const hasActiveMaintenance = async (destId, destTypeId) => {
//   await getDestinationResult(destId, destTypeId)
//   if (
//     _.isNull(destinationResult) ||
//     (_.isNull(destinationResult.maint_start) &&
//       _.isNull(destinationResult.maint_end))
//   ) {
//     return false
//   } else {
//     return (
//       destinationResult.maint_start <= new Date() &&
//       (_.isNull(destinationResult.maint_end) ||
//         destinationResult.maint_end >= new Date())
//     )
//   }
// }

// function appendJurisdictionsAssignedToUser(
//   hubURLS: string[],
//   jurisdictions: any
// ) {
//   return hubURLS.map(
//     (izgUrl) => izgUrl + '?include=' + `${jurisdictions?.join(',')}`
//   )
// }
