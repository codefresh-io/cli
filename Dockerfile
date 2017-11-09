FROM node
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ENTRYPOINT ["node" ,"index.js"]