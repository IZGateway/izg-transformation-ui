# izg-xform-console

This project contains source code for the IZ Gateway Xform Console. This is written using the following technologies:

- NodeJS
- NextJS
- NextAuthJS
- Material UI
- Docker Compose

## Usage for local development

The following prerequisites must be met for the first-time install and run the application on a local environment

- NodeJS installed and active
- Docker & Docker compose installed
- Okta account for the localhost client

NOTE: A certificate for connecting to an instance of IZ Gateway is not necessary, however the connection status feature will not function without a certificate. You will see errors in the console but they do not prevent the application from running.

### **Step 1: Create .env and .env.local text files in project root directory**

NextJS will use values found in the .env.local file. Below is an example of the keys that require values custom to your environment

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_URL_INTERNAL=http://localhost:3000
NEXTAUTH_SECRET=<enter generated secret>
OKTA_CLIENT_ID=<enter client id>
OKTA_CLIENT_SECRET=<Okta secret>
NEXT_PUBLIC_OKTA_ISSUER=<the URL for the Okta service>
NEXT_PUBLIC_GA_ID=<id>
NEXTAUTH_DEBUG=true
IZG_ENDPOINT_CRT_PATH=<crt cert file path>
IZG_ENDPOINT_KEY_PATH=<private key file path>
IZG_ENDPOINT_PASSCODE=<passcode for certs>
XFORM_ENDPOINT=<server endpoint for transformation service api>
XFORM_SERVICE_HEALTHCHECK_URL=<server endpoint for healthcheck API>
```

### **Step 2: Install Dependencies**

Install dependencies by running

```
npm install
```

### **Step 3: Start local application**

- Runs 'npm run dev' to start the node application on port 3000

### **After start**

Navigate to http://localhost:3000 in a browser and you should see the application prompt you for a okta login
