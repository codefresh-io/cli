FROM node:8.8.0-alpine

WORKDIR /cf-cli

COPY package.json /cf-cli

RUN yarn --prod install

COPY . /cf-cli

RUN ln -s $(pwd)/lib/interface/cli/index.js /usr/local/bin/codefresh

ENTRYPOINT ["codefresh"]