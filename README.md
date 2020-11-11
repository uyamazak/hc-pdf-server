# hc-pdf-server

Simple and fast PDF rendering server by Headless Chrome.

GET URL or POST HTML returns PDF binary.

This is new version of [hcep-pdf-server](https://github.com/uyamazak/hcep-pdf-server/) with TypeScript and new features.

## New features compared to hcep-pdf-server

- Writing in TypeScript
- Use Fasity https://www.fastify.io/ for speed
- Use alpine for less image size in Docker
- You can Change User Agent and Accept Language etc with env
- Bearer token authorization Support

# Getting Started

## Clone
git clone this repository.

You can try it in 2 ways: docker or local

## 1. With docker

### Requirement
You need install docker.

https://docs.docker.com/get-docker/

```zsh
docker build -t hc-pdf-server:latest .
```

```zsh
docker run -it -p 8080:8080 hc-pdf-server:latest
```

### Install Fonts  (optionary)
If you convert pages in Japanese, Chinese or languages other than English with Docker.
You will need to install each font files.
Also, you can use WEB fonts, but since it takes a long time for requesting and downloading them,
we recommend that install the font files in the server.

#### 1. from font files
Add your font files (ex. *.otf) to `fonts/` dir. And build image.

```zsh
cp AnyFonts.ttf ./fonts/
```

#### 2. from apk packages
You can use build-arg `ADDITONAL_FONTS` as package names.

See below available font package names.

https://wiki.alpinelinux.org/wiki/Fonts

```zsh
docker build --build-arg ADDITONAL_FONTS=font-noto-cjk -t hc-pdf-server:latest .

# multiple
docker build --build-arg ADDITONAL_FONTS="font-noto-cjk font-ipa" -t hc-pdf-server:latest .
```

## 2. Local (for development use)

### Requirement
You need to install Node and yarn.


install packages

```zsh
yarn install
```

start dev server
```zsh
yarn dev
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

## Get request with url parameter

```zsh
curl "http://localhost:8080?url=http://example.com" -o hcpdf-get.pdf
```


## POST request with html parameter
```zsh
curl -sS http://localhost:8080 -v -d html="<html><p>hcpdf <strong>ok</strong></p></html>" -o hcpdf-post.pdf
```

# Options

## PDF options

The Puppeteer's PDF options are flexible and complex.

I thought about taking them directly as GET or POST parameters, but it's not simple, so I went with the preset method.

Just pass the preset names you have prepared as pdfoptions and you can use them.

There are default presets available.

[src/pdf-options/presets/defaults.ts](src/pdf-options/presets/defaults.ts)

You can extend it or create another file and switch it by environment variables.

```zsh
# make file
vim src/pdf-options/presets/my-preset.ts

# and set env example with dorcker run
docker run -it -p 8080:8080 -e HCPDF_PDF_OPTION_PRESET_FILE_PATH='./presets/my-preset' hc-pdf-server:latest
```

The default is the minimum size (e.g. A4). If you have something you think should be included, I'd be happy to receive a pull request.


You can check what options are currently available by looking at the following path after the server starts

```zsh
$ curl http://localhost:8080/pdfoptions
{"A4":{"format":"A4","margin":{"top":"10mm","bottom":"10mm","left":"10mm","right":"10mm"},"printBackground":true},"A3":{"format":"A3","margin":{"top":"10mm","bottom":"10mm","left":"10mm","right":"10mm"},"printBackground":true},"A4L":{"format":"A4","landscape":true,"margin":{"top":"10mm","bottom":"10mm","left":"10mm","right":"10mm"},"printBackground":true},"A3L":{"format":"A3","landscape":true,"margin":{"top":"10mm","bottom":"10mm","left":"10mm","right":"10mm"},"printBackground":true}}
```


## Bearer Authorization
You can enable bearer auth (default disabled) by setting your secret key to `HCPDF_BEARER_AUTH_SECRET_KEY`.

```zsh
curl "http://localhost:8080/?url=http://example.com" -H 'Authorization: Bearer yourSecretKey' -o hcpdf-auth-get.pdf
```

This feature uses the following the plugin. Details are below.

https://github.com/fastify/fastify-bearer-auth

## Other options

Various settings can be changed by environment variables. See the following file for details

[src/config.ts](src/config.ts)

# Test

## Local

```zsh
# Because test use comnpiled js files, you need build before test
yarn build

yarn test
```

## Docker

```zsh
# before you need build image
docker run hc-pdf-server:latest yarn test
```

# Contributing
Pull requests, Issues, [GitHub Sponsors](https://github.com/sponsors/uyamazak/) are welcome.


# License
Licensed under [Apache License](LICENSE)
