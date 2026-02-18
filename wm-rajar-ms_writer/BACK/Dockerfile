FROM node:20

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
