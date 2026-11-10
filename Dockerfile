FROM node:24.22.2-alpine3.24@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8
ARG TARGETPLATFORM
RUN echo '@edge http://dl-cdn.alpinelinux.org/alpine/edge/main' >> /etc/apk/repositories \
  && apk --update add --no-cache \
    bash \
    ca-certificates \
    curl \
    git \
    jq@edge
RUN npm upgrade -g npm
COPY --from=mikefarah/yq:4.53.3 /usr/bin/yq /usr/local/bin/yq
ADD --chmod=775 https://dl.k8s.io/release/v1.36.1/bin/${TARGETPLATFORM}/kubectl /usr/local/bin/kubectl
WORKDIR /cf-cli
COPY package.json yarn.lock check-version.js run-check-version.js /cf-cli/
RUN yarn install --prod --frozen-lockfile && \
    yarn cache clean
COPY . /cf-cli
RUN yarn generate-completion

# Purpose of security:
RUN npm uninstall -g --logs-max=0 corepack npm

RUN ln -s $(pwd)/lib/interface/cli/codefresh /usr/local/bin/codefresh
RUN codefresh components update --location components

# Node.js warnings must be suppressed to ensure that automations relying on exact output are not disrupted
ENV NODE_NO_WARNINGS=1
ENTRYPOINT ["codefresh"]
