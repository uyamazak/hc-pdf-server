FROM node:14.15.0-alpine3.12 as build
COPY package.json yarn.lock /app/
WORKDIR /app
RUN yarn install --frozen-lockfile

FROM node:14.15.0-alpine3.12
# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker
# Installs latest Chromium (85) package.
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads /app \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

WORKDIR /app
COPY --from=build /app/node_modules /app/node_modules
COPY src/ /app/src
COPY package.json yarn.lock tsconfig.json tsconfig.build.json /app/
RUN yarn build

# Fastify in docker needs 0.0.0.0
# https://github.com/fastify/fastify/issues/935
ENV HCPDF_SERVER_ADDRESS=0.0.0.0

EXPOSE 8080

CMD ["yarn", "start"]
