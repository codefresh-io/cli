FROM golang:alpine as go

RUN apk --update add ca-certificates git

RUN go get github.com/github/hub

FROM codefresh/node:10.15.3-alpine3.11

RUN apk --update add --no-cache ca-certificates git curl bash yarn

COPY --from=go /go/bin/hub /usr/local/bin/hub

ARG JQ_VERSION=1.6
ARG YQ_VERSION=2.4.1

RUN wget -O /usr/local/bin/jq https://github.com/stedolan/jq/releases/download/jq-${JQ_VERSION}/jq-linux64 && \
    wget -O /usr/local/bin/yq https://github.com/mikefarah/yq/releases/download/${YQ_VERSION}/yq_linux_amd64 && \
    chmod +x /usr/local/bin/*

WORKDIR /cf-cli

COPY package.json /cf-cli
COPY check-version.js /cf-cli

RUN yarn install --prod --frozen-lockfile && \
    yarn cache clean

COPY . /cf-cli

RUN yarn generate-completion
RUN apk del yarn

RUN ln -s $(pwd)/lib/interface/cli/codefresh /usr/local/bin/codefresh

ENTRYPOINT ["codefresh"]
