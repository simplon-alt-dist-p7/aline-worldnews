FROM node:20

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install
COPY . .
EXPOSE 5175
CMD ["npx", "vite", "dev", "--host", "0.0.0.0", "--port", "5175"]
