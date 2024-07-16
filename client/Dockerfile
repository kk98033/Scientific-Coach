# 使用官方 Node.js 圖像
FROM node:16

# 設置工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製所有源文件，包括 public 文件夾
COPY . .

# 構建前端應用
RUN npm run build

# 安裝 serve 以提供構建的應用
RUN npm install -g serve

# 暴露應用運行的端口
EXPOSE 5000

# 使用 serve 提供應用
CMD ["serve", "-s", "dist", "-l", "5000"]
