FROM node:20

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5174
CMD ["npx", "vite", "preview", "5174"]