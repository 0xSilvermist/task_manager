FROM node:20-alpine

WORKDIR /app

# Копираме package файлове
COPY package*.json ./

# Инсталираме зависимости
RUN npm ci

# Копираме source файлове
COPY . .

# Build на приложението
RUN npm run build

# Expose порт 3000
EXPOSE 3000

# Стартираме production сървър
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]

