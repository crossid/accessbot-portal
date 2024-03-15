# AccessBot Portal

Web UI to interact with the [AccessBot](https://github.com/crossid/accessbot).


# Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

# Env file

Required env vars:

```bash
AUTH_SECRET=random_string
AUTH_PROVIDERS=hydra,auth0,...
OAUTH2_CLIENT_ID=oauth2-client-id
OAUTH2_CLIENT_SECRET=oauth2-client-secret
OAUTH2_ISSUER=https://issuer-url
OAUTH2_AUDIENCE=https://my-audience
```