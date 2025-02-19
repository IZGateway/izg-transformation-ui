FROM node:21-alpine3.20 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --force

FROM node:21-alpine3.20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set directory permissions and clean any existing cache
RUN rm -rf .next && \
    mkdir -p /app/.next/cache && \
    chmod -R 777 /app/.next

ENV NEXT_TELEMETRY_DISABLED 1
ARG BUILD_ID=0.0.0
ARG NEXT_PUBLIC_OKTA_ISSUER=BAKED_NEXT_PUBLIC_OKTA_ISSUER
ARG NEXT_PUBLIC_GA_ID=BAKED_NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_BUILD_ID=${BUILD_ID}
# Force production mode and disable cache
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
RUN npm run build

FROM ghcr.io/izgateway/alpine-node-openssl-fips:latest AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN apk add bash

COPY package.json package-lock.json ./
RUN  npm ci --omit=dev --force && find . -type f -name 'yarn.lock' -delete
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/filebeat.yml ./filebeat.yml
COPY --from=builder /app/metricbeat.yml ./metricbeat.yml
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/start-app.sh ./start-app.sh
COPY --from=builder --chown=nextjs:nodejs /app/replace-variable.sh ./replace-variable.sh

# Install filebeat

RUN apk add curl libc6-compat
ENV FILEBEAT_VERSION=8.15.0
RUN curl https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-${FILEBEAT_VERSION}-linux-x86_64.tar.gz -o ./filebeat.tar.gz && \
    tar xzvf filebeat.tar.gz && \
    rm filebeat.tar.gz && \
    mv filebeat-${FILEBEAT_VERSION}-linux-x86_64 filebeat && \
    cd filebeat && \
    cp filebeat /usr/bin && \
    rm -rf /filebeat/filebeat.yml && \
    cp ../filebeat.yml ./filebeat.yml

# Replace default metricbeat config with custom config file
RUN cd ../metricbeat && \
    rm -rf /metricbeat/metricbeat.yml && \
    cp ../app/metricbeat.yml ./metricbeat.yml

#USER nextjs
RUN chmod a+x replace-variable.sh
RUN chmod a+x start-app.sh
EXPOSE 3000

ENV PORT 3000

ENTRYPOINT ["bash", "start-app.sh"]
