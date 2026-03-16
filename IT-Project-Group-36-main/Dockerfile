# 阶段 1: 构建前端
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend
COPY react-web-app/package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY react-web-app/ ./
RUN npm run build

# 阶段 2: 后端运行环境
FROM python:3.13.4

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 复制并安装 Python 依赖
COPY flask-server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY flask-server/ .

# 从前端构建中复制静态文件
COPY --from=frontend-builder /app/frontend/dist ./static

# 暴露端口
EXPOSE 5000

# 启动 gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
