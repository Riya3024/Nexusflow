FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
RUN npm run build

WORKDIR /app
EXPOSE 3001

CMD ["node", "server/index.js"]