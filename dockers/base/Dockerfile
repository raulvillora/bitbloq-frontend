FROM alpine:3.3
COPY node_modules /bitbloq-frontend
COPY bower_components /bitbloq-frontend
COPY bower-template.json /bitbloq-frontend/bower-template.json
COPY package-template.json /bitbloq-frontend/package-template.json
CMD ["/bin/sh", "-c", "sleep 2000000"]
