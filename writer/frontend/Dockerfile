FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 5175
CMD ["npx", "vite", "dev", "--host", "0.0.0.0", "--port", "5174"]