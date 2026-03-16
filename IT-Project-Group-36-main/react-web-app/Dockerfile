# 阶段 1: 构建前端
FROM node:18-alpine as builder

WORKDIR /app

# 复制 package 文件（现在相对于 react-web-app/ 目录）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用代码
COPY . ./

# 构建
RUN npm run build

# 阶段 2: Nginx 服务
FROM nginx:alpine

# 安装依赖
RUN apk add --no-cache \
    bash \
    git \
    openssh \
    libstdc++

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制已构建的文件
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]