FROM node:9.2.0-alpine

RUN apk update && apk add git

WORKDIR /cf-cli

COPY package.json /cf-cli

RUN yarn --prod install

COPY . /cf-cli

RUN ln -s $(pwd)/lib/interface/cli/codefresh /usr/local/bin/codefresh

ENTRYPOINT ["codefresh"]
