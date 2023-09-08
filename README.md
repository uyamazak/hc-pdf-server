[![CI](https://github.com/uyamazak/hc-pdf-server/workflows/ci/badge.svg)](https://github.com/uyamazak/hc-pdf-server/actions?query=workflow%3Aci)
[![Docker](https://github.com/uyamazak/hc-pdf-server/workflows/docker-build/badge.svg)](https://github.com/uyamazak/hc-pdf-server/actions?query=workflow%3Adocker-build)
[![CodeQL](https://github.com/uyamazak/hc-pdf-server/workflows/CodeQL/badge.svg)](https://github.com/uyamazak/hc-pdf-server/actions?query=workflow%3ACodeQL)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg?style=flat)](LICENSE)

# hc-pdf-server

convert HTML to PDF server by Headless Chrome.

GET URL or POST HTML returns PDF binary.

This is new version of [hcep-pdf-server](https://github.com/uyamazak/hcep-pdf-server/) with buit-in TypeScript supoort and sufficient testing, excellent new features.

Of course, Docker is also supported!

## New features compared to hcep-pdf-server

- Writing in TypeScript
- Use [Fasity](https://www.fastify.io/) instead of [Express](https://expressjs.com/) for native TypeScript support and fast response
- You can Change User Agent and Accept Language etc with environment variables
- Bearer token authorization Support

# Getting Started

## Clone
git clone this repository.

## Run
You can try it in 2 ways: 1.`Docker` or 2.`Local`

### 1. Docker

#### Requirement
You need install docker.

https://docs.docker.com/get-docker/

#### Build without installing fonts

```zsh
docker build -t hc-pdf-server:latest .
```

#### Install Fonts (optionary)
If you wanto to convert pages in Japanese, Chinese or languages other than English with Docker.

You will need to install each font files.

Also, you can use WEB fonts, but since it takes a long time for requesting and downloading them,
we recommend that install the font files in the server.


##### 1. From font file
Add your font files (ex. *.otf) to `fonts/` dir.

```zsh
cp AnyFonts.ttf ./fonts/
```

And build image.

```zsh
docker build -t hc-pdf-server:latest .
```

##### 2. From package
You can use build-arg `ADDITONAL_FONTS` as package names.

See below available font package names.

https://packages.debian.org/stable/fonts/

```zsh
docker build \
  --build-arg ADDITONAL_FONTS=fonts-ipafont \
  -t hc-pdf-server:latest .

# multiple (split by space)
docker build \
  --build-arg ADDITONAL_FONTS="fonts-ipafont fonts-ipaexfont-gothic" \
  -t hc-pdf-server:latest .
```
#### Run docker
```zsh
docker run -it -p 8080:8080 hc-pdf-server:latest
```

### 2. Local (for development use)

#### Requirement
You need to install Node.js and yarn.

- [Node.js](https://nodejs.org/)
- [yarn](https://classic.yarnpkg.com/)

install packages
```zsh
yarn install
```

start dev server
```zsh
yarn dev
```

lint and fix
```zsh
yarn lint
```

compile ts files
```zsh
yarn build
```

launch server
```zsh
yarn start
```

# Usage
## GET request '/' with URL parameter

```zsh
curl "http://localhost:8080?url=http://example.com" -o hcpdf-get.pdf
```
[hcpdf-get.pdf](/docs/pdf-samples/hcpdf-get.pdf)

## POST request '/' with HTML parameter
`html` parameter should be urlencoded beforehand, as the inclusion of certain characters (e.g. "&") can cause problems.

```zsh
curl -sS http://localhost:8080 -v \
  --data-urlencode html="<html><p>hcpdf <strong>ok</strong></p></html>"\
  -o hcpdf-post.pdf
```
[hcpdf-post.pdf](/docs/pdf-samples/hcpdf-post.pdf)

# Customize PDF options by preset name

The Puppeteer's PDF options are flexible and complex.

I thought about taking them directly as GET or POST parameters, but it's not simple.

So I make with the preset method.

Just pass the preset name as request parameter `pdf_option` that you have prepared in `PDFOptionsPreset`.

The default presets are below.

[src/pdf-options/presets/default.ts](src/pdf-options/presets/defaults.ts)

You can extend it or create another file and switch it by environment variables.

```zsh
# make file
cp src/pdf-options/presets/my-preset.sample.ts src/pdf-options/presets/my-preset.ts

# edit
vim src/pdf-options/presets/my-preset.ts

# build image
docker build -t hc-pdf-server:latest .

# and set env example with dorcker run
docker run -it -p 8080:8080 \
  -e HCPDF_PRESET_PDF_OPTIONS_FILE_PATH='./presets/my-preset' \
  -e HCPDF_DEFAULT_PRESET_PDF_OPTIONS_NAME='MYA4' \
  hc-pdf-server:latest

# request with pdf_option
curl "http://localhost:8080?url=http://example.com&pdf_option=MYA4" -o hcpdf-get-MYA4.pdf
```

The default is the minimum (e.g. A4, A3).

If you have something you think should be included, I'd be happy to receive a pull request.

You can check what options are currently available by looking at the following path after the server starts

```zsh
$ curl http://localhost:8080/pdf_options
{"A4":{"format":"A4","margin":{"top":"10mm","bottom":"10mm","left":"10mm","right":"10mm"},"printBackground":true},"A3":{"format":"A3","margin":{"top":"10mm","bottom":"10mm","left":"10mm","right":"10mm"},"printBackground":true},"A4L":{"format":"A4","landscape":true,"margin":{"top":"10mm","bottom":"10mm","left":"10mm","right":"10mm"},"printBackground":true},"A3L":{"format":"A3","landscape":true,"margin":{"top":"10mm","bottom":"10mm","left":"10mm","right":"10mm"},"printBackground":true}}
```


# Bearer Authorization
You can enable bearer auth by setting your secret key to `HCPDF_BEARER_AUTH_SECRET_KEY` (default empty, disabled) .

This application can be exploited if it is published on a global network, as it allows you to manipulate Chrome.

So it is recommended that you enable this option to control access to it when you place it on a global network.

```zsh
docker run -it -p 8080:8080 \
  -e HCPDF_BEARER_AUTH_SECRET_KEY='yourSecretKey' \
  hc-pdf-server:latest

curl "http://localhost:8080/?url=http://example.com" \
  -H 'Authorization: Bearer yourSecretKey' \
  -o hcpdf-auth-get.pdf
```

This feature uses the following the plugin.

Details are below.

https://github.com/fastify/fastify-bearer-auth

# Support for concurrent access

In Puppeteer, if you make another request to `Page` during the PDF conversion process, it will result in an error.

At present, it seems not to be able to judge whether `Page` is being processed or not.

Therefore, in hc-pdf-server, the error is avoided by preparing two or more `Page` at the time of server starting, and using them in order.

The number of starting pages can be changed by env `HCPDF_PAGES_NUM` (default: 3).

If you increase the number of pages, the memory required will also increase, so adjust it according to your machine resource.

# Configuring with environment variables
All have a prefix of `'HCPDF_'`
## PDF Options presets
Multiple PDF Options can be prepared in advance and used upon request.
see detail about [PDF options](https://pptr.dev/#?product=Puppeteer&version=v8.0.0&show=api-pagepdfoptions)

### HCPDF_PRESET_PDF_OPTIONS_FILE_PATH
If the default is not sufficient, please specify your own.
Specify relative path from `plugins/pdf-options.ts`

default: '../pdf-options/presets/default'

### HCPDF_DEFAULT_PRESET_PDF_OPTIONS_NAME
defalt key name.

default: 'DEFAULT'

You can change the default items for simple changes such as size and margins

### HCPDF_DEFAULT_PDF_OPTION_FORMAT

Corresponds to `format`
```
Letter: 8.5in x 11in
Legal: 8.5in x 14in
Tabloid: 11in x 17in
Ledger: 17in x 11in
A0: 33.1in x 46.8in
A1: 23.4in x 33.1in
A2: 16.54in x 23.4in
A3: 11.7in x 16.54in
A4: 8.27in x 11.7in
A5: 5.83in x 8.27in
A6: 4.13in x 5.83in
```

### HCPDF_DEFAULT_PDF_OPTION_MARGIN

Corresponds to all `margin`s

### HCPDF_DEFAULT_PDF_OPTION_PRINT_BACKGROUND
Corresponds `printBackground`

### HCPDF_DEFAULT_PDF_OPTION_LANDSCAPE
Corresponds to `landscape`

## Page settings
### HCPDF_PAGES_NUM
Allows you to specify the number of pages to be launched when the server starts.

Change the number according to the number of requests and the response speed and server resources.

default: 3

### HCPDF_USER_AGENT
You can change the User agent string.

default: puppeteer's user agent

### HCPDF_PAGE_TIMEOUT_MILLISECONDS
Timeout values used in various Page operations.
see detail [Page.setDefaultTimeout()](https://pptr.dev/#?product=Puppeteer&version=v8.0.0&show=api-pagesetdefaulttimeouttimeout)

default: 10000
### HCPDF_EMULATE_MEDIA_TYPE_SCREEN_ENABLED
if 'true', CSS media type set to `screen`

default: false (`print`)

### HCPDF_ACCEPT_LANGUAGE
Accept-Language can be given at the time of request.

default: ''
## Server settings

### HCPDF_SERVER_ADDRESS

default: '127.0.0.1'

### HCPDF_SERVER_PORT

default: 8080

### HCPDF_FASTIFY_BODY_LIMIT
The maximum request size that the server will accept.

default: 10485760 (10MiB)

### HCPDF_BEARER_AUTH_SECRET_KEY
see [Bearer Authorization](#bearer-authorization)

default: '' (disabled)


## Viewport
see [page.setViewport](https://pptr.dev/#?product=Puppeteer&version=v8.0.0&show=api-pagesetviewportviewport)
### HCPDF_VIEWPORT_WIDTH
default: 800
### HCPDF_VIEWPORT_HEIGHT
default: 600

### HCPDF_DEVICE_SCALE_FACTOR
default: 1

### HCPDF_VIEWPORT_IS_MOBILE
default: false

### HCPDF_VIEWPORT_HAS_TOUCH
default: false
### HCPDF_VIEWPORT_IS_LANDSCAPE
default: false

## Browser Launch Options
### HCEP_DEFAULT_BROWSER_LAUNCH_ARGS
`args` of browser launch options. Comma separated string needed.

default: '--no-sandbox,--disable-setuid-sandbox,--disable-gpu,--disable-dev-shm-usage'

see [puppeteer.launch](https://pptr.dev/#?product=Puppeteer&version=v13.5.2&show=api-puppeteerlaunchoptions)

## Others
Other settings can be changed by environment variables.

See the following file for details.

[src/config.ts](src/config.ts)

# Test

## Local

```zsh
yarn test
```

### Result example
![test result example](docs/img/test-result.png)


## Docker

```zsh
# before you need build image
docker build -t hc-pdf-server:latest .

docker run hc-pdf-server:latest yarn test
```
# License
Licensed under [Apache License](LICENSE)

# Contributing
Pull requests, Issues, [GitHub Sponsors](https://github.com/sponsors/uyamazak/) are welcome.

# Contributors ✨
Thanks!

- [salos1982](https://github.com/salos1982)

# Author
[uyamazak](https://github.com/uyamazak)


