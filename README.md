# hc-pdf-server

Simple and fast PDF rendering server by Headless Chrome.

GET URL or POST HTML returns PDF binary.

This is new version of [hcep-pdf-server](https://github.com/uyamazak/hcep-pdf-server/) with TypeScript and new version of puppeteer.


# Examples

## Get request with url parameter

```curl "http://localhost:8080?url=http://example.com" -o hcpdf-get.pdf```


## POST request with html parameter
```curl -sS http://localhost:8080 -v -d html="<html><p>hcpdf <strong>ok</strong></p></html>" -o hcpdf-post.pdf```



# Docker

```
docker build -t hc-pdf-server:latest .
```

```
docker run -it -p 8080:8080 hc-pdf-server:latest
```

# Local (for development use)
Install yarn.

```
yarn install
```

```
yarn dev
```

```
yarn start
```

# Bearer Auth
You can enable bearer auth (default disabled) by setting your secret key to `HCPDF_BEARER_AUTH_SECRET_KEY`.

```
curl "http://127.0.0.1:8080/?url=https://google.com" -H 'Authorization: Bearer yourSecretKey' -o hcpdf-auth-get.pdf
```

more detail

https://github.com/fastify/fastify-bearer-auth
