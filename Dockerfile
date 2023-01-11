FROM node:19-alpine3.16
LABEL author="f0"
ENV NODE_ENV=test
ENV PORT=3000
WORKDIR /var/www
COPY package*.json ./
RUN npm install
COPY . ./
EXPOSE $PORT
ENTRYPOINT [ "node", "Cryptonite.js" ]