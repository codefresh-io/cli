FROM node:9.2.0-alpine

RUN apk add --update git curl jq py-pip && pip install yq

WORKDIR /cf-cli

COPY package.json /cf-cli

RUN yarn --prod install

COPY . /cf-cli

RUN ln -s $(pwd)/lib/interface/cli/codefresh /usr/local/bin/codefresh

VOLUME /root

ENTRYPOINT ["codefresh"]
