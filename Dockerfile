# The base image uses the :latest tag on purpose. The base image rebuilds every day
# with security patches, and :latest gives each build of this image those patches.
# GHCR has no version tags for the base image. A digest pin stops the patches.
# hadolint ignore=DL3007
FROM ghcr.io/izgateway/alpine-node-openssl-fips:latest AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# The GitHub Packages token comes from a BuildKit secret, not an ARG, so the image
# history does not keep it. Build with: --secret id=npm_token,env=NPM_TOKEN
# The npmrc is on a tmpfs mount, so no layer keeps it. It holds the literal text
# ${NPM_TOKEN}, and npm reads the value from the environment. Do not put the token
# on the npm command line: npm writes its command line to /root/.npm/_logs.
RUN --mount=type=secret,id=npm_token,required=true \
    --mount=type=tmpfs,target=/run/npm-auth \
    printf '%s\n' \
        '@izgateway:registry=https://npm.pkg.github.com/' \
        "//npm.pkg.github.com/:_authToken=\${NPM_TOKEN}" > /run/npm-auth/.npmrc \
    && NPM_TOKEN="$(cat /run/secrets/npm_token)" \
    && export NPM_TOKEN \
    && npm ci --userconfig=/run/npm-auth/.npmrc \
    && rm -rf /root/.npm/_logs

# hadolint ignore=DL3007
FROM ghcr.io/izgateway/alpine-node-openssl-fips:latest AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set directory permissions and clean any existing cache
RUN rm -rf .next && \
    mkdir -p /app/.next/cache && \
    chmod -R 777 /app/.next

ENV NEXT_TELEMETRY_DISABLED=1
ARG BUILD_ID=0.0.0
ARG NEXT_PUBLIC_OKTA_ISSUER=BAKED_NEXT_PUBLIC_OKTA_ISSUER
ARG NEXT_PUBLIC_GA_ID=BAKED_NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_BUILD_ID=${BUILD_ID}
# Force production mode and disable cache
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
RUN npm run build

# hadolint ignore=DL3007
FROM ghcr.io/izgateway/alpine-node-openssl-fips:latest AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY package.json package-lock.json ./

# nginx is no longer installed here (IGDD-3010) — it is provided by the base image.
# Fail the build fast if a future base image stops shipping the nginx binary or the
# 'nginx' user that nginx.conf's `user nginx;` directive requires, rather than
# discovering it at container runtime when run_and_monitor.sh tries to start nginx.
RUN if ! command -v nginx >/dev/null 2>&1; then echo "ERROR: nginx binary not found; must be provided by the base image."; exit 1; fi \
    && if ! id -u nginx >/dev/null 2>&1; then echo "ERROR: 'nginx' user not found; required by 'user nginx;' in nginx.conf."; exit 1; fi

# Install Dependencies and cleanup yarn.lock if present
# The token is a BuildKit secret, as in the deps stage. This is the final image.
# The base image supplies bash, curl, and libc6-compat (through gcompat).
# This stage adds tini.
RUN --mount=type=secret,id=npm_token,required=true \
    --mount=type=tmpfs,target=/run/npm-auth \
    apk add --no-cache "tini>=0.19" \
    && printf '%s\n' \
        '@izgateway:registry=https://npm.pkg.github.com/' \
        "//npm.pkg.github.com/:_authToken=\${NPM_TOKEN}" > /run/npm-auth/.npmrc \
    && NPM_TOKEN="$(cat /run/secrets/npm_token)" \
    && export NPM_TOKEN \
    && npm ci --omit=dev --userconfig=/run/npm-auth/.npmrc \
    && rm -rf /root/.npm/_logs \
    && find . -type f -name 'yarn.lock' -delete

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/filebeat.yml ./filebeat.yml
COPY --from=builder /app/metricbeat.yml ./metricbeat.yml
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/replace-variable.sh ./replace-variable.sh
COPY --from=builder /app/run_and_monitor.sh ./run_and_monitor.sh

# Replace default filebeat config with custom config file
RUN rm -rf /filebeat.yml \
    && cp /app/filebeat.yml /filebeat/filebeat.yml

# Replace default metricbeat config with custom config file
RUN rm -rf /metricbeat/metricbeat.yml \
    && cp /app/metricbeat.yml /metricbeat/metricbeat.yml

# Configure Nginx
RUN mkdir -p /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/nginx.conf

# Set up proper permissions
RUN chmod a+x replace-variable.sh
RUN chmod a+x run_and_monitor.sh

# Expose only 443 (to nginx)
EXPOSE 443

# This is only an environment variable telling NextJS which port to use.
# This DOES NOT expose port 3000
ENV PORT=3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/run_and_monitor.sh"]
