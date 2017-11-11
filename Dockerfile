FROM node
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD ["npm" , "link"]
ENTRYPOINT ["node" ,"index.js"]