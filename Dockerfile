# 1. 빌드 스테이지
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. 실행 스테이지
FROM node:20-alpine AS runner
WORKDIR /app

# PM2 설치
RUN npm install -g pm2

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
#COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

EXPOSE 3000

# PM2로 실행 (컨테이너 유지를 위해 pm2-runtime 사용)
CMD ["npm","run","start"]
