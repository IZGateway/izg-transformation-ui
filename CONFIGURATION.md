# Configurable Environment variables for Xform Console

| KEY                             | DESCRIPTION                                                                                                                                             | DEFAULT VALUE | REQUIRED |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :-----------: | :------: |
| OKTA_CLIENT_SECRET              | Secret generated when creating a client in Okta. Used for Okta authentication.                                                                          |   undefined   |   true   |
| OKTA_CLIENT_ID                  | ID for a particular Okta client. Used for Okta authentication.                                                                                          |   undefined   |   true   |
| OKTA_ISSUER                     | URL to the Okta instance.                                                                                                                               |   undefined   |   true   |
| XFORM_SERVICE_ENDPOINT_CRT_PATH | Certificate used to connect to Xform Service endpoint.                                                                                                  |   undefined   |   true   |
| XFORM_SERVICE_ENDPOINT_KEY_PATH | Key used with the certificate to connect to Xform Service endpoint.                                                                                     |   undefined   |   true   |
| XFORM_SERVICE_ENDPOINT_PASSCODE | Passcode in association with the certificate to authorize and connect with Xform Service.                                                               |   undefined   |   true   |
| NEXTAUTH_SECRET                 | Used to encrypt the NextAuth.js JWT, and to hash email verification tokens. This is the default value for the secret option in NextAuth and Middleware. |   undefined   |   true   |
| NEXTAUTH_DEBUG                  | Set debug to true to enable debug messages for authentication and database operations.                                                                  |     false     |  false   |
| NEXTAUTH_URL                    | When deploying to production, set the NEXTAUTH_URL environment variable to the canonical URL of your site.                                              |   undefined   |   true   |
| ELASTIC_API_KEY                 | Key for elastic search endpoint.                                                                                                                        |   undefined   |   true   |
| ELASTIC_HOST                    | Elastic Search endpoint used Monitoring.                                                                                                                |   undefined   |   true   |
| ELASTIC_INDEX                   | Elastic Search Index to be used for xform console.                                                                                                      |   undefined   |   true   |
| ELASTIC_ENV_TAG                 | Environment tag if is dev or prod.                                                                                                                      |   undefined   |   true   |
| LOG_LEVEL                       | Logging level, eg : error,warn,info,http,verbose,debug,silly                                                                                            |     info      |  false   |
