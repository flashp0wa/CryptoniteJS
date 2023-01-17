FROM node:19-alpine3.16

LABEL author="f0"

ENV NODE_ENV=${environment}
ENV PORT=3000

WORKDIR /var/www

COPY package*.json ./

RUN npm install
RUN apk update && apk add ${packages}

COPY . ./

EXPOSE $PORT

RUN chmod +x wait-for.sh

RUN echo "Environment: ${environment}"

