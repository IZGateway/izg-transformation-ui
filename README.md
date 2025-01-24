# Xform Console

This project contains source code for Xform Console. This is written using the following technologies:

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

### Step 1: Create .env file in project root directory

Running the application either via npm or via Docker will use the .env file.

_Copy_ the .env.example file in the repository to .env and update.  **DO NOT** edit .env.example.

### Step 2: Install Dependencies

Install dependencies by running

```
npm install --force
```

### Step 3: Start local application

Run

```bash
npm run dev -- --port 80
```

This will start the application on port 80.  The development Okta has redirects setup on http://localhost port 80.

### After start

Navigate to http://localhost:3000 in a browser and you should see the application prompt you for a okta login
