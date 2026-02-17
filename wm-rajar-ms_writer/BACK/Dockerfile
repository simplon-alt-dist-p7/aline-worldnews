FROM node:20

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5174"]
