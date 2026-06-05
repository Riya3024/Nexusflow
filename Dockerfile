FROM node:20-alpine

WORKDIR /app

# Copy entire project
COPY . .

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Build client
WORKDIR /app/client
RUN npm install
RUN npm run build

# Start server
WORKDIR /app/server

EXPOSE 3001

CMD ["npm", "start"]