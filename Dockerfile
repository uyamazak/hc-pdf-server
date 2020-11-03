FROM node:14.15.0-alpine3.12 as package_install
COPY package.json yarn.lock /app/
WORKDIR /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN yarn install --frozen-lockfile


FROM node:14.15.0-alpine3.12

# Fastify in docker needs 0.0.0.0
# https://github.com/fastify/fastify/issues/935
ENV HCPDF_SERVER_ADDRESS=0.0.0.0

# Locale settings (ex. Japanese)
# this will affect HTTP_ACCEPT_LANGUAGE, navigator.language etc
ENV LANG ja_JP.UTF-8

# Font settings
RUN apk update && \
  apk add --no-cache fontconfig

# Install fonts files
COPY fonts/* /usr/share/fonts/

# OR install font by apk https://wiki.alpinelinux.org/wiki/Fonts
# RUN apk add font-noto-cjk

RUN fc-cache -fv

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

WORKDIR /app
COPY --from=package_install /app/node_modules /app/node_modules
COPY src/ /app/src
COPY test/ /app/test
COPY package.json yarn.lock tsconfig.json tsconfig.build.json /app/
RUN yarn build

EXPOSE 8080

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
  && mkdir -p /home/pptruser/Downloads /app \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

CMD ["yarn", "start"]
