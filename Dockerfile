FROM golang:alpine as go

RUN apk --update add ca-certificates git

RUN go get github.com/github/hub

FROM python:3.7 as yq

ARG YQ_VERSION=2.10.0

RUN pip install yq==${YQ_VERSION} && \
    pip install pyinstaller==3.6 && \
    pyinstaller --onefile /usr/local/bin/yq --dist /tmp/

FROM codefresh/node:10.15.3-alpine3.11

RUN apk --update add --no-cache ca-certificates git curl bash yarn

COPY --from=go /go/bin/hub /usr/local/bin/hub
COPY --from=yq /tmp/yq /usr/local/bin/yq

# add glibc compatibility layer for the compiled yq
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-2.30-r0.apk && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-bin-2.30-r0.apk && \
    apk add glibc-2.30-r0.apk glibc-bin-2.30-r0.apk && \
    rm /etc/apk/keys/sgerrand.rsa.pub 

ARG JQ_VERSION=1.6

RUN wget -O /usr/local/bin/jq https://github.com/stedolan/jq/releases/download/jq-${JQ_VERSION}/jq-linux64 && \
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
