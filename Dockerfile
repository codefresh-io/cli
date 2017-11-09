FROM node
WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm link cf-cli
COPY . /app
CMD ["node" ,"index.js"]