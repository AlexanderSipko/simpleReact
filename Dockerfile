# ========== Stage 1: Build React App ==========
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --silent

# 2. Копируем исходный код
COPY . .

# 3. Собираем приложение (это создаст папку /app/dist)
RUN npm run build

# ========== Stage 2: Nginx Server ==========
FROM nginx:alpine

# 4. Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# 5. Копируем конфиг nginx
COPY nginx.conf /etc/nginx/nginx.conf

# 6. Открываем порты
EXPOSE 80

# 7. Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]