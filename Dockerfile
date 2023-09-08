# https://github.com/uyamazak/hc-pdf-server
FROM --platform=linux/amd64 node:18-buster-slim as package_install
LABEL maintainer="uyamazak<yu.yamazaki85@gmail.com>"
COPY package.json yarn.lock /app/
WORKDIR /app
# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
RUN ["yarn", "install", "--frozen-lockfile"]


FROM --platform=linux/amd64 node:18-buster-slim
# Fastify in docker needs 0.0.0.0
# https://github.com/fastify/fastify/issues/935
ENV HCPDF_SERVER_ADDRESS=0.0.0.0

# Install fonts from debian packages https://packages.debian.org/stable/fonts/
ARG ADDITONAL_FONTS=""

# https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update && apt-get upgrade -y \
  && apt-get install -y google-chrome-stable ${ADDITONAL_FONTS} fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install fonts from files
COPY fonts/* /usr/share/fonts/
RUN fc-cache -fv

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

EXPOSE 8080

# Install puppeteer so it's available in the container.
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && mkdir -p /app \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

WORKDIR /app
COPY --chown=pptruser:pptruser --from=package_install /app/node_modules /app/node_modules
COPY --chown=pptruser:pptruser src/ /app/src
COPY --chown=pptruser:pptruser test/ /app/test
COPY --chown=pptruser:pptruser package.json \
  tsconfig.json \
  tsconfig.build.json \
  tsconfig.eslint.json \
  .prettierrc.js \
  /app/
RUN yarn build

# Run everything after as non-privileged user.
USER pptruser

CMD ["yarn", "start"]
