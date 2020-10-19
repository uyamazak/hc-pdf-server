# hc-pdf-server

Simple and fast PDF rendering server by Headless Chrome.

GET URL or POST HTML returns PDF binary.

This is new version of [hcep-pdf-server](https://github.com/uyamazak/hcep-pdf-server/) with TypeScript and new version of puppeteer.


# Examples

## Get request with url parameter

```curl "http://localhost:8080?url=http://example.com" -o hcpdf-get.pdf```


## POST request with html parameter
```curl -sS http://localhost:8080 -v -d html="<html><p>hcpdf <strong>ok</strong></p></html>" -o hcpdf-post.pdf```

