# go hub binary
FROM golang:alpine as go
RUN apk --update add ca-certificates git
RUN go install github.com/github/hub@latest

# Main
FROM node:18.16.0-alpine3.17

RUN apk --update add --no-cache ca-certificates git curl bash jq yq

COPY --from=go /go/bin/hub /usr/local/bin/hub

WORKDIR /cf-cli

COPY package.json /cf-cli
COPY yarn.lock /cf-cli
COPY check-version.js /cf-cli
COPY run-check-version.js /cf-cli

RUN yarn install --prod --frozen-lockfile && \
    yarn cache clean

COPY . /cf-cli

RUN yarn generate-completion

RUN ln -s $(pwd)/lib/interface/cli/codefresh /usr/local/bin/codefresh

RUN codefresh components update --location components
ENTRYPOINT ["codefresh"]
