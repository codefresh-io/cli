FROM node:24.12.0-alpine3.23
ARG TARGETPLATFORM
RUN apk --update add --no-cache \
    bash \
    ca-certificates \
    curl \
    git \
    jq
RUN npm upgrade -g npm
COPY --from=mikefarah/yq:4.50.1 /usr/bin/yq /usr/local/bin/yq
ADD --chmod=775 https://dl.k8s.io/release/v1.35.0/bin/${TARGETPLATFORM}/kubectl /usr/local/bin/kubectl
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
