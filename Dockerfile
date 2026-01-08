# go hub binary
FROM golang:alpine AS go
RUN apk --update add --no-scripts ca-certificates git

# Main
FROM node:24.12.0-alpine3.23
RUN apk --update add --no-cache \
    bash \
    ca-certificates \
    curl \
    git \
    jq
RUN npm upgrade -g npm
COPY --from=mikefarah/yq:4.50.1 /usr/bin/yq /usr/local/bin/yq
COPY --from=quay.io/codefresh/kubectl:1.35.0 /usr/local/bin/kubectl /usr/local/bin/
WORKDIR /cf-cli
COPY package.json yarn.lock check-version.js run-check-version.js /cf-cli/
RUN yarn install --prod --frozen-lockfile && \
    yarn cache clean
COPY . /cf-cli
RUN yarn generate-completion
RUN ln -s $(pwd)/lib/interface/cli/codefresh /usr/local/bin/codefresh
RUN codefresh components update --location components

# Node.js warnings must be suppressed to ensure that automations relying on exact output are not disrupted
ENV NODE_NO_WARNINGS=1
ENTRYPOINT ["codefresh"]
