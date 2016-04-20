FROM alpine:3.3
COPY node_modules /bitbloq-frontend
COPY bower_components /bitbloq-frontend
COPY bower-template.json /bitbloq-frontend/bower-template.json
COPY package-template.json /bitbloq-frontend/package-template.json
ENTRYPOINT ["while true; do echo "Server on fire!"; sleep 2; done"]
