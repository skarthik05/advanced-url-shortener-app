FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production


COPY ./src ./src

EXPOSE 80

CMD ["npm", "start"]
